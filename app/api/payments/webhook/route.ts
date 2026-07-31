import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe, isStripeConfigured } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!isStripeConfigured() || !stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers.get("stripe-signature");
  const raw = await req.text();

  let event;
  if (secret && sig) {
    try {
      event = stripe.webhooks.constructEvent(raw, sig, secret);
    } catch (err: any) {
      return NextResponse.json({ error: `Webhook signature failed: ${err.message}` }, { status: 400 });
    }
  } else {
    // Dev fallback (no signature verification) — DO NOT use in production
    try {
      event = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "Bad payload" }, { status: 400 });
    }
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as { id: string; metadata?: Record<string, string> };
    const investmentId = intent.metadata?.investmentId;
    if (investmentId) {
      const inv = await prisma.investment.update({
        where: { id: investmentId },
        data: { status: "PAID", paidAt: new Date() },
      });
      await prisma.property.update({
        where: { id: inv.propertyId },
        data: { soldShares: { increment: inv.shares } },
      });
    }
  } else if (event.type === "payment_intent.payment_failed") {
    const intent = event.data.object as { metadata?: Record<string, string> };
    const investmentId = intent.metadata?.investmentId;
    if (investmentId) {
      await prisma.investment.update({
        where: { id: investmentId },
        data: { status: "FAILED" },
      });
    }
  }

  return NextResponse.json({ received: true });
}
