import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  formatSAR,
  formatDate,
  PROPERTY_TYPE_AR,
  LISTING_AR,
  CONDITION_AR,
  RISK_AR,
} from "@/lib/format";
import Link from "next/link";
import { InquiryForm } from "@/components/InquiryForm";
import { PropertyMap } from "@/components/PropertyMap";

export const dynamic = "force-dynamic";

export default async function PropertyDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const property = await prisma.property.findUnique({
    where: { id: params.id },
    include: {
      report: true,
      owner: { select: { name: true, phone: true } },
    },
  });

  if (!property) notFound();

  const images: string[] = (() => {
    try {
      return JSON.parse(property.images);
    } catch {
      return [];
    }
  })();
  const cover = images[0] ?? "https://picsum.photos/seed/aqar/1200/800";

  const r = property.report;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Gallery */}
          <div className="card overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cover} alt={property.title} className="w-full aspect-[16/10] object-cover" />
            {images.length > 1 && (
              <div className="p-2 grid grid-cols-4 gap-2">
                {images.slice(1, 5).map((img) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={img}
                    src={img}
                    alt=""
                    className="w-full aspect-square object-cover rounded"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Title + facts */}
          <div className="card p-6">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {property.isCertified && (
                <span className="badge-certified">✓ العراب Certified</span>
              )}
              <span className="badge bg-slate-100 text-slate-700">
                {LISTING_AR[property.listingType]}
              </span>
              <span className="badge bg-slate-100 text-slate-700">
                {PROPERTY_TYPE_AR[property.propertyType]}
              </span>
            </div>
            <h1 className="text-2xl font-bold mb-2">{property.title}</h1>
            <div className="text-slate-600 mb-4">
              {property.city}
              {property.district ? ` — ${property.district}` : ""}
              {property.address ? ` — ${property.address}` : ""}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-slate-200 my-4">
              <Fact label="السعر" value={formatSAR(property.price)} highlight />
              <Fact label="المساحة" value={`${property.area} م²`} />
              {property.bedrooms != null && <Fact label="غرف" value={String(property.bedrooms)} />}
              {property.bathrooms != null && <Fact label="حمامات" value={String(property.bathrooms)} />}
              {property.yearBuilt && <Fact label="سنة البناء" value={String(property.yearBuilt)} />}
            </div>

            <h2 className="font-bold mb-2">وصف العقار</h2>
            <p className="text-slate-700 leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {property.latitude != null && property.longitude != null && (
            <div className="card p-6">
              <h2 className="font-bold mb-3">الموقع على الخريطة</h2>
              <PropertyMap
                latitude={property.latitude}
                longitude={property.longitude}
              />
            </div>
          )}

          {/* Engineering report */}
          {r ? (
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-lg bg-brand-600 text-white grid place-items-center font-bold">
                  ✓
                </div>
                <div>
                  <div className="font-bold">التقرير الهندسي — Alarrab Certified</div>
                  <div className="text-xs text-slate-500">
                    صادر من {r.certifiedBy} · {formatDate(r.issuedAt)}
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <Fact label="الحالة الإنشائية" value={CONDITION_AR[r.structuralCondition] ?? r.structuralCondition} />
                <Fact label="جودة التشطيبات" value={CONDITION_AR[r.finishingQuality] ?? r.finishingQuality} />
                <Fact label="الأنظمة الكهربائية" value={CONDITION_AR[r.electricalCondition] ?? r.electricalCondition} />
                <Fact label="الأنظمة الميكانيكية" value={CONDITION_AR[r.mechanicalCondition] ?? r.mechanicalCondition} />
                <div>
                  <div className="text-xs text-slate-500 mb-1">مستوى المخاطر</div>
                  <span
                    className={
                      r.riskLevel === "LOW"
                        ? "badge-risk-low"
                        : r.riskLevel === "MEDIUM"
                        ? "badge-risk-medium"
                        : "badge-risk-high"
                    }
                  >
                    {RISK_AR[r.riskLevel] ?? r.riskLevel}
                  </span>
                </div>
                <Fact label="العمر الافتراضي" value={`${r.estimatedLifespan} سنة`} />
              </div>

              {r.valueUpliftPotential != null && r.valueUpliftPotential > 0 && (
                <div className="rounded-xl bg-brand-50 border border-brand-200 p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-brand-700 font-bold">📈 فرصة رفع القيمة</span>
                    <span className="badge bg-brand-600 text-white">
                      +{r.valueUpliftPotential}%
                    </span>
                  </div>
                  {r.upliftScope && (
                    <p className="text-sm text-slate-700 mb-3">{r.upliftScope}</p>
                  )}
                  <div className="grid sm:grid-cols-3 gap-3 text-sm">
                    {r.upliftCost && (
                      <Fact label="التكلفة التقديرية" value={formatSAR(r.upliftCost)} />
                    )}
                    {r.upliftDurationMonths && (
                      <Fact label="مدة التنفيذ" value={`${r.upliftDurationMonths} شهر`} />
                    )}
                    {r.expectedReturnPct && (
                      <Fact label="العائد المتوقع" value={`+${r.expectedReturnPct}%`} />
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-3">
                    دراسة تطوير بواسطة Azoom United Contracting
                  </div>
                </div>
              )}

              <h3 className="font-bold mb-2">التوصيات الهندسية</h3>
              <p className="text-slate-700 leading-relaxed">{r.recommendations}</p>
            </div>
          ) : (
            <div className="card p-6 border-amber-200 bg-amber-50/60">
              <div className="font-semibold text-amber-800 mb-1">
                هذا العقار قيد المراجعة الهندسية
              </div>
              <div className="text-sm text-amber-700">
                لم يصدر بعد اعتماد العراب لهذا العقار. سيظهر التقرير الهندسي هنا فور اعتماده.
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="card p-6 sticky top-20">
            <div className="text-sm text-slate-500 mb-1">السعر</div>
            <div className="text-3xl font-black text-brand-700 mb-4">
              {formatSAR(property.price)}
            </div>

            {property.listingType === "PARTIAL_SALE" &&
              property.totalShares &&
              property.sharePriceSAR && (
                <div className="rounded-lg bg-brand-50 border border-brand-200 p-4 mb-4">
                  <div className="text-xs text-brand-800 font-semibold mb-1">
                    بيع جزئي — استثمر بحصص
                  </div>
                  <div className="text-sm text-slate-700 mb-3">
                    {formatSAR(property.sharePriceSAR)} / حصة ·{" "}
                    {property.totalShares - property.soldShares} حصة متاحة
                  </div>
                  <Link
                    href={`/properties/${property.id}/invest`}
                    className="btn-primary w-full"
                  >
                    استثمر الآن →
                  </Link>
                </div>
              )}

            <div className="border-t border-slate-200 pt-4 mb-4">
              <div className="text-sm text-slate-500 mb-1">المالك</div>
              <div className="font-semibold">{property.owner.name}</div>
              {property.owner.phone && (
                <div className="text-sm text-slate-600 mt-1">
                  {property.owner.phone}
                </div>
              )}
            </div>
            <InquiryForm propertyId={property.id} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function Fact({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className={highlight ? "text-brand-700 font-bold text-lg" : "font-semibold"}>
        {value}
      </div>
    </div>
  );
}
