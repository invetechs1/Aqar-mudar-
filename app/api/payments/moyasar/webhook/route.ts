import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { audit } from "@/lib/audit";
import { logger } from "@/lib/logger";
import { sendEmail, templates } from "@/lib/email";
import { notify } from "@/lib/notify";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-moyasar-webhook-secret");
  if (env.MOYASAR_WEBHOOK_SECRET) {
    if (secret !== env.MOYASAR_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "invalid secret" }, { status: 401 });
    }
  }

  const body = await req.json().catch(() => null);
  if (!body?.data) return NextResponse.json({ error: "bad payload" }, { status: 400 });

  const payment = body.data;
  const investmentId: string | undefined = payment?.metadata?.investmentId;
  const status: string = payment?.status ?? "";

  if (!investmentId) {
    logger.warn("moyasar_webhook_no_metadata", { event: body.type });
    return NextResponse.json({ ok: true });
  }

  const inv = await prisma.investment.findUnique({
    where: { id: investmentId },
    include: { property: true, user: true },
  });
  if (!inv) return NextResponse.json({ ok: true });

  if (status === "paid" && inv.status === "PENDING") {
    await prisma.$transaction([
      prisma.investment.update({
        where: { id: inv.id },
        data: { status: "PAID", paidAt: new Date(), providerRef: payment.id },
      }),
      prisma.property.update({
        where: { id: inv.propertyId },
        data: { soldShares: { increment: inv.shares } },
      }),
    ]);

    const msg = templates.investmentReceipt(inv.user.name, {
      propertyTitle: inv.property.title,
      shares: inv.shares,
      amountSAR: inv.amountSAR,
      reference: payment.id,
    });
    await sendEmail({ to: inv.user.email, ...msg }).catch(() => {});
    await notify(
      inv.userId,
      "investment.paid",
      "تم إتمام الاستثمار",
      `تم استلام دفعتك لـ ${inv.property.title}`,
      { investmentId: inv.id }
    );
    await audit({
      action: "payment.moyasar.paid",
      resource: "investment",
      resourceId: inv.id,
      userId: inv.userId,
    });
  } else if (status === "failed") {
    await prisma.investment.update({
      where: { id: inv.id },
      data: { status: "FAILED" },
    });
    await audit({
      action: "payment.moyasar.failed",
      resource: "investment",
      resourceId: inv.id,
      userId: inv.userId,
    });
  } else if (status === "refunded") {
    await prisma.$transaction([
      prisma.investment.update({
        where: { id: inv.id },
        data: { status: "REFUNDED", refundedAt: new Date() },
      }),
      prisma.property.update({
        where: { id: inv.propertyId },
        data: { soldShares: { decrement: inv.shares } },
      }),
    ]);
    await audit({
      action: "payment.moyasar.refunded",
      resource: "investment",
      resourceId: inv.id,
      userId: inv.userId,
    });
  }

  return NextResponse.json({ ok: true });
}
