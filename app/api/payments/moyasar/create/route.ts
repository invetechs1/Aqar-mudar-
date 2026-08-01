import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { createPayment, isMoyasarConfigured } from "@/lib/moyasar";
import { env } from "@/lib/env";
import { audit } from "@/lib/audit";
import { rateLimit, clientKey } from "@/lib/rateLimit";

const schema = z.object({
  propertyId: z.string().min(1),
  shares: z.number().int().positive().max(10000),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const rl = await rateLimit(clientKey(req, `pay:${session.user.id}`), 10, 300);
  if (!rl.allowed) return NextResponse.json({ error: "محاولات كثيرة" }, { status: 429 });

  if (!isMoyasarConfigured()) {
    return NextResponse.json(
      { error: "بوابة الدفع غير مهيأة. أضف MOYASAR_SECRET_KEY في .env" },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });

  const { propertyId, shares } = parsed.data;
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  if (
    property.listingType !== "PARTIAL_SALE" ||
    !property.totalShares ||
    !property.sharePriceSAR
  ) {
    return NextResponse.json({ error: "غير متاح للبيع الجزئي" }, { status: 400 });
  }
  const remaining = property.totalShares - property.soldShares;
  if (shares > remaining) {
    return NextResponse.json({ error: `الحد الأقصى المتاح: ${remaining}` }, { status: 400 });
  }

  const amountSAR = shares * property.sharePriceSAR;
  const amountHalalas = Math.round(amountSAR * 100);

  const investment = await prisma.investment.create({
    data: {
      shares,
      amountSAR,
      propertyId,
      userId: session.user.id,
      provider: "MOYASAR",
    },
  });

  const payment = await createPayment({
    amountHalalas,
    description: `Aqar Mudar — ${property.title} — ${shares} shares`,
    callbackUrl: `${env.NEXTAUTH_URL}/properties/${propertyId}/invest/callback?investment=${investment.id}`,
    metadata: {
      investmentId: investment.id,
      propertyId,
      userId: session.user.id,
      shares: String(shares),
    },
  });

  await prisma.investment.update({
    where: { id: investment.id },
    data: { providerRef: payment.id },
  });

  await audit({
    action: "payment.moyasar.create",
    resource: "investment",
    resourceId: investment.id,
    userId: session.user.id,
    metadata: { paymentId: payment.id, amountSAR },
    request: req,
  });

  return NextResponse.json({
    investmentId: investment.id,
    paymentId: payment.id,
    publishableKey: env.MOYASAR_PUBLISHABLE_KEY,
    amountSAR,
  });
}
