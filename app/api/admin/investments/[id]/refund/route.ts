import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { refundPayment as moyasarRefund } from "@/lib/moyasar";
import { stripe } from "@/lib/stripe";
import { audit } from "@/lib/audit";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "ممنوع" }, { status: 403 });
  }

  const inv = await prisma.investment.findUnique({ where: { id: params.id } });
  if (!inv) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  if (inv.status !== "PAID") {
    return NextResponse.json({ error: "لا يمكن استرداد استثمار غير مدفوع" }, { status: 400 });
  }
  if (!inv.providerRef) return NextResponse.json({ error: "مرجع الدفع مفقود" }, { status: 400 });

  try {
    if (inv.provider === "MOYASAR") {
      await moyasarRefund(inv.providerRef);
    } else if (inv.provider === "STRIPE") {
      if (!stripe) return NextResponse.json({ error: "Stripe غير مهيأ" }, { status: 503 });
      await stripe.refunds.create({ payment_intent: inv.providerRef });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "فشل الاسترداد" }, { status: 500 });
  }

  // For Stripe the webhook flips state; for defensive local update:
  await audit({
    action: "payment.refund_requested",
    resource: "investment",
    resourceId: inv.id,
    userId: session.user.id,
    request: req,
  });
  return NextResponse.json({ ok: true });
}
