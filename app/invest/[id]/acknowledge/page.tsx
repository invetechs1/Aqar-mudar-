import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatSAR } from "@/lib/format";
import { features } from "@/lib/features";
import { AcknowledgeForm } from "@/components/AcknowledgeForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "إقرار المستثمر" };

export default async function AcknowledgePage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect(`/auth/signin?callbackUrl=/invest/${params.id}/acknowledge`);

  const property = await prisma.property.findUnique({ where: { id: params.id } });
  if (!property) notFound();

  // The gated screen is only meaningful for the fractional-sale flow.
  if (property.listingType !== "PARTIAL_SALE" || !features.partialSale) {
    redirect(`/properties/${params.id}`);
  }

  return (
    <div style={{ background: "#f5f8f6", minHeight: "100vh" }}>
      <div className="mx-auto page-x" style={{ maxWidth: 780, padding: "40px 32px 80px" }}>
        <div className="text-xs uppercase tracking-widest text-muted mb-2">
          الخطوة ٣ من ٤ — قبل إتمام الاستثمار
        </div>
        <h1 className="font-extrabold" style={{ fontSize: 36, letterSpacing: "-0.01em" }}>
          إقرار المستثمر
        </h1>
        <p className="mt-3 text-muted-2 font-light" style={{ fontSize: 15, lineHeight: 1.9 }}>
          يُسجَّل كل بند من الإقرارات أدناه ككيان مستقل مع التاريخ وعنوان IP للحساب.
          لا يمكن إتمام الاستثمار قبل الموافقة على جميع البنود.
        </p>

        <div className="card mt-6" style={{ padding: "28px 32px" }}>
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4" style={{ borderBottom: "1px solid #eef2f0" }}>
            <div>
              <div className="text-xs text-muted uppercase tracking-wider">العقار</div>
              <div className="font-bold mt-1" style={{ fontSize: 16 }}>{property.title}</div>
              <div className="text-sm text-muted mt-1">
                {property.city}
                {property.district ? ` — ${property.district}` : ""}
              </div>
            </div>
            <div className="text-end">
              <div className="text-xs text-muted uppercase tracking-wider">السعر الإجمالي</div>
              <div className="tabular font-bold mt-1" style={{ color: "#2f6a53", fontSize: 20 }}>
                {formatSAR(property.price)}
              </div>
              {property.isCertified && <span className="chip-certified mt-1 inline-block">✓ العراب Certified</span>}
            </div>
          </div>

          <AcknowledgeForm propertyId={property.id} />
        </div>

        <div className="legal-block mt-6">
          <h4>تحذير: قد تخسر رأس المال</h4>
          <p>
            الاستثمار العقاري ينطوي على مخاطر قد تؤدي إلى فقدان جزء أو كامل رأس المال المستثمر.
            الأرقام والعوائد الواردة تقديرية وليست ضمانًا. راجع{" "}
            <Link href="/legal/risk" className="underline font-semibold">إفصاح مخاطر الاستثمار</Link>
            {" "}قبل المتابعة.
          </p>
        </div>
      </div>
    </div>
  );
}
