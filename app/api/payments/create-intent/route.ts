import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { hasCompleteConsent } from "@/lib/consent";
import { features } from "@/lib/features";

const schema = z.object({
  propertyId: z.string().min(1),
  shares: z.number().int().positive(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  if (!isStripeConfigured() || !stripe) {
    return NextResponse.json(
      { error: "بوابة الدفع غير مهيأة. أضف STRIPE_SECRET_KEY في .env" },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
  }
  const { propertyId, shares } = parsed.data;

  if (!features.partialSale) {
    return NextResponse.json(
      { error: "البيع الجزئي غير متاح حاليًا — قيد الترخيص النظامي." },
      { status: 400 }
    );
  }

  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  if (property.listingType !== "PARTIAL_SALE" || !property.totalShares || !property.sharePriceSAR) {
    return NextResponse.json(
      { error: "هذا العقار غير متاح للبيع الجزئي" },
      { status: 400 }
    );
  }

  const consented = await hasCompleteConsent({
    userId: session.user.id,
    scope: "INVEST_ACK",
    scopeRefId: propertyId,
  });
  if (!consented) {
    return NextResponse.json(
      {
        error: "يجب استكمال إقرار المستثمر قبل الدفع.",
        redirect: `/invest/${propertyId}/acknowledge`,
      },
      { status: 412 }
    );
  }
  const remaining = property.totalShares - property.soldShares;
  if (shares > remaining) {
    return NextResponse.json(
      { error: `الحد الأقصى المتاح: ${remaining} حصة` },
      { status: 400 }
    );
  }

  const amountSAR = shares * property.sharePriceSAR;
  const amountHalalas = Math.round(amountSAR * 100);

  const investment = await prisma.investment.create({
    data: {
      shares,
      amountSAR,
      propertyId,
      userId: session.user.id,
    },
  });

  const intent = await stripe.paymentIntents.create({
    amount: amountHalalas,
    currency: "sar",
    automatic_payment_methods: { enabled: true },
    metadata: {
      investmentId: investment.id,
      propertyId,
      userId: session.user.id,
      shares: String(shares),
    },
  });

  await prisma.investment.update({
    where: { id: investment.id },
    data: { stripePaymentIntentId: intent.id },
  });

  return NextResponse.json({
    clientSecret: intent.client_secret,
    investmentId: investment.id,
    amountSAR,
  });
}
