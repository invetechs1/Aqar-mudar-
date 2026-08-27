import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import {
  formatSAR,
  formatDate,
  PROPERTY_TYPE_AR,
  LISTING_AR,
  CONDITION_AR,
  RISK_AR,
} from "@/lib/format";
import { InquiryForm } from "@/components/InquiryForm";
import { PropertyMap } from "@/components/PropertyMap";
import { JsonLd } from "@/components/JsonLd";
import { env } from "@/lib/env";
import { features } from "@/lib/features";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const property = await prisma.property.findUnique({
    where: { id: params.id },
    select: { title: true, description: true, city: true, images: true },
  });
  if (!property) return { title: "غير موجود" };
  const imgs = Array.isArray(property.images) ? (property.images as string[]) : [];
  return {
    title: property.title,
    description: property.description.slice(0, 160),
    openGraph: {
      title: property.title,
      description: property.description.slice(0, 160),
      images: imgs.length ? [imgs[0]] : undefined,
    },
  };
}

const RISK_CHIP: Record<string, string> = {
  LOW: "chip-ok",
  MEDIUM: "chip-warn",
  HIGH: "chip-err",
};

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

  const images: string[] = Array.isArray(property.images)
    ? (property.images as string[])
    : [];
  const cover = images[0] ?? "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200";
  const thumbs = images.slice(1, 4);

  const r = property.report;

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.description,
    url: `${env.NEXTAUTH_URL}/properties/${property.id}`,
    image: images,
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: "SAR",
      availability: "https://schema.org/InStock",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: property.city,
      addressRegion: property.district ?? undefined,
      addressCountry: "SA",
    },
    ...(property.latitude != null && property.longitude != null && {
      geo: {
        "@type": "GeoCoordinates",
        latitude: property.latitude,
        longitude: property.longitude,
      },
    }),
    floorSize: {
      "@type": "QuantitativeValue",
      value: property.area,
      unitCode: "MTK",
    },
    ...(property.bedrooms != null && { numberOfRooms: property.bedrooms }),
  };

  return (
    <div className="mx-auto max-w-page page-x" style={{ padding: "24px 32px 80px" }}>
      <JsonLd data={productSchema} />

      <nav className="text-xs text-muted mb-6" aria-label="breadcrumb">
        <Link href="/" className="hover:text-green-700">الرئيسية</Link>
        <span className="mx-2">/</span>
        <Link href="/properties" className="hover:text-green-700">العقارات</Link>
        <span className="mx-2">/</span>
        <span className="text-muted-2">{property.title}</span>
      </nav>

      <div
        className="flex flex-wrap"
        style={{ gap: 28 }}
      >
        {/* MAIN */}
        <div style={{ flex: "2 1 560px", minWidth: 0 }} className="space-y-6">
          {/* Gallery */}
          <div
            className="grid overflow-hidden"
            style={{
              gridTemplateColumns: thumbs.length ? "2fr 1fr" : "1fr",
              gap: 10,
              borderRadius: 22,
            }}
          >
            <div style={{ minHeight: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cover}
                alt={property.title}
                className="w-full object-cover"
                style={{ height: 420, borderRadius: 16 }}
              />
            </div>
            {thumbs.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {thumbs.map((img) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={img}
                    src={img}
                    alt=""
                    className="object-cover w-full"
                    style={{ flex: "1 1 0", minHeight: 0, height: "auto", borderRadius: 16 }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Facts card */}
          <div className="card" style={{ padding: 28 }}>
            <div className="flex flex-wrap gap-2 mb-4">
              {property.isCertified && (
                <span className="chip-certified">✓ العراب Certified</span>
              )}
              <span className="chip-muted">{LISTING_AR[property.listingType]}</span>
              <span className="chip-muted">{PROPERTY_TYPE_AR[property.propertyType]}</span>
            </div>
            <h1 className="font-extrabold" style={{ fontSize: 32, letterSpacing: "-0.01em" }}>
              {property.title}
            </h1>
            <div className="text-muted mt-2" style={{ fontSize: 15 }}>
              {property.city}
              {property.district ? ` — ${property.district}` : ""}
              {property.address ? ` — ${property.address}` : ""}
            </div>

            <div
              className="grid gap-6 mt-6 pt-6"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                borderTop: "1px solid #eef2f0",
              }}
            >
              <Fact label="السعر" value={formatSAR(property.price)} highlight />
              <Fact label="المساحة" value={`${property.area} م²`} />
              {property.bedrooms != null && <Fact label="غرف" value={String(property.bedrooms)} />}
              {property.bathrooms != null && <Fact label="حمامات" value={String(property.bathrooms)} />}
              {property.yearBuilt && <Fact label="سنة البناء" value={String(property.yearBuilt)} />}
            </div>

            <div className="mt-6 pt-6" style={{ borderTop: "1px solid #eef2f0" }}>
              <h2 className="font-bold mb-3" style={{ fontSize: 18 }}>وصف العقار</h2>
              <p className="text-muted-2 font-light whitespace-pre-line" style={{ fontSize: 15, lineHeight: 1.9 }}>
                {property.description}
              </p>
            </div>
          </div>

          {/* Engineering report */}
          {r ? (
            <div className="card overflow-hidden">
              <div
                className="flex items-center gap-4"
                style={{ padding: "22px 28px", borderBottom: "1px solid #eef2f0" }}
              >
                <div
                  className="grid place-items-center flex-none text-lg font-bold"
                  style={{
                    width: 46,
                    height: 46,
                    background: "#16302a",
                    color: "#e6c982",
                    borderRadius: 12,
                  }}
                >
                  ✓
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold" style={{ fontSize: 16 }}>
                    التقرير الهندسي — Alarrab Certified
                  </div>
                  <div className="text-xs text-muted tabular mt-1">
                    صادر من {r.certifiedBy} · {formatDate(r.issuedAt)}
                  </div>
                </div>
                <span className={RISK_CHIP[r.riskLevel] ?? "chip-muted"}>
                  مخاطر: {RISK_AR[r.riskLevel] ?? r.riskLevel}
                </span>
              </div>

              <div style={{ padding: 28 }}>
                <div
                  className="grid gap-4"
                  style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}
                >
                  <IndicatorTile label="الحالة الإنشائية" value={CONDITION_AR[r.structuralCondition]} />
                  <IndicatorTile label="جودة التشطيبات" value={CONDITION_AR[r.finishingQuality]} />
                  <IndicatorTile label="الأنظمة الكهربائية" value={CONDITION_AR[r.electricalCondition]} />
                  <IndicatorTile label="الأنظمة الميكانيكية" value={CONDITION_AR[r.mechanicalCondition]} />
                  <IndicatorTile label="مستوى المخاطر" value={RISK_AR[r.riskLevel]} />
                  <IndicatorTile label="العمر الافتراضي" value={`${r.estimatedLifespan} سنة`} />
                </div>

                {r.valueUpliftPotential != null && r.valueUpliftPotential > 0 && (
                  <div
                    className="mt-6"
                    style={{
                      background: "#16302a",
                      color: "#ffffff",
                      borderRadius: 18,
                      padding: 24,
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-bold" style={{ color: "#e6c982", fontSize: 15 }}>
                        ↗ فرصة رفع القيمة <span className="text-xs opacity-70 font-normal">(تقديري)</span>
                      </div>
                      <span
                        className="tabular"
                        style={{
                          background: "#c9a24a",
                          color: "#16302a",
                          padding: "4px 12px",
                          borderRadius: 999,
                          fontWeight: 800,
                          fontSize: 13,
                        }}
                      >
                        +{r.valueUpliftPotential}%
                      </span>
                    </div>
                    {r.upliftScope && (
                      <p style={{ color: "#b9cfc4", fontSize: 14, lineHeight: 1.8, marginBottom: 16 }}>
                        {r.upliftScope}
                      </p>
                    )}
                    <div className="grid grid-cols-3 gap-4" style={{ paddingTop: 14, borderTop: "1px solid rgba(255,255,255,.08)" }}>
                      {r.upliftCost && (
                        <UpliftStat label="التكلفة التقديرية" value={formatSAR(r.upliftCost)} />
                      )}
                      {r.upliftDurationMonths && (
                        <UpliftStat label="مدة التنفيذ" value={`${r.upliftDurationMonths} شهر`} />
                      )}
                      {r.expectedReturnPct && (
                        <UpliftStat
                          label="العائد المتوقع"
                          value={`+${r.expectedReturnPct}%`}
                          note="تقديري"
                        />
                      )}
                    </div>
                    <div className="text-xs mt-4" style={{ color: "#7f9a8f" }}>
                      دراسة تطوير بواسطة Azoom United Contracting — الأرقام تقديرية.
                    </div>
                  </div>
                )}

                <div
                  className="mt-6"
                  style={{
                    background: "#f5f8f6",
                    borderRadius: 14,
                    padding: 20,
                    borderInlineStart: "3px solid #2f6a53",
                  }}
                >
                  <h4 className="uppercase text-xs tracking-wider font-semibold mb-2" style={{ color: "#2f6a53" }}>
                    التوصيات الهندسية
                  </h4>
                  <p className="text-muted-2 font-light" style={{ fontSize: 15, lineHeight: 1.9 }}>
                    {r.recommendations}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: 24, background: "#fdf6e6", borderColor: "#f2e2b6" }}>
              <div className="font-semibold" style={{ color: "#b28a35" }}>
                هذا العقار قيد المراجعة الهندسية
              </div>
              <div className="text-sm mt-1" style={{ color: "#8a6a1f" }}>
                لم يصدر بعد اعتماد العراب لهذا العقار. سيظهر التقرير الهندسي هنا فور اعتماده.
              </div>
            </div>
          )}

          {/* NEW: Risk & disclaimer block */}
          <div className="legal-block">
            <h4>تنبيه المخاطر — يُرجى القراءة قبل اتخاذ أي قرار</h4>
            <p>
              الأرقام والعوائد والتقديرات الواردة أعلاه (نسبة رفع القيمة، التكلفة التقديرية،
              العائد المتوقع، والعمر الافتراضي) هي تقديرات هندسية مبنية على حالة العقار في
              تاريخ الفحص، ولا تُعدّ ضمانًا لأي عائد مستقبلي. القيمة السوقية للعقار قد ترتفع أو تنخفض.
            </p>
            <p style={{ color: "#8a7a52", fontSize: 13 }}>
              الاستثمار العقاري ينطوي على مخاطر. راجع{" "}
              <Link href="/legal/risk" className="underline font-semibold">إفصاح مخاطر الاستثمار</Link>
              {" و "}
              <Link href="/legal/disclaimer" className="underline font-semibold">إخلاء المسؤولية</Link>
              {" "}قبل اتخاذ قرار.
            </p>
          </div>

          {/* Map */}
          {property.latitude != null && property.longitude != null && (
            <div className="card" style={{ padding: 20 }}>
              <h2 className="font-bold mb-3" style={{ fontSize: 18 }}>الموقع على الخريطة</h2>
              <div style={{ borderRadius: 16, overflow: "hidden" }}>
                <PropertyMap latitude={property.latitude} longitude={property.longitude} height={280} />
              </div>
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <aside style={{ flex: "1 1 320px", position: "sticky", top: 96, alignSelf: "flex-start" }}>
          <div className="card" style={{ padding: 26, boxShadow: "0 8px 28px rgba(22,48,42,.07)" }}>
            <div className="text-xs text-muted uppercase tracking-wider">السعر</div>
            <div
              className="tabular"
              style={{
                fontSize: 32,
                fontWeight: 800,
                color: "#2f6a53",
                letterSpacing: "-0.02em",
                marginTop: 6,
                whiteSpace: "nowrap",
              }}
            >
              {formatSAR(property.price)}
            </div>

            {property.listingType === "PARTIAL_SALE" && (
              <PartialSaleSlot />
            )}

            <div className="mt-6 pt-5" style={{ borderTop: "1px solid #eef2f0" }}>
              <div className="text-xs text-muted uppercase tracking-wider">المالك</div>
              <div className="font-bold mt-1">{property.owner.name}</div>
              {property.owner.phone && (
                <div className="text-sm text-muted-2 mt-1 tabular">{property.owner.phone}</div>
              )}
            </div>

            <div className="mt-5">
              <InquiryForm propertyId={property.id} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Fact({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div className="text-xs text-muted uppercase tracking-wider mb-2">{label}</div>
      <div
        className={`font-extrabold tabular ${highlight ? "text-green-700" : "text-ink"}`}
        style={{
          fontSize: highlight ? 20 : 17,
          letterSpacing: "-0.005em",
          whiteSpace: highlight ? "nowrap" : undefined,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function IndicatorTile({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: "#f5f8f6", borderRadius: 14, padding: 18 }}>
      <div className="text-xs text-muted uppercase tracking-wider mb-2">{label}</div>
      <div className="font-bold text-ink" style={{ fontSize: 16 }}>{value}</div>
    </div>
  );
}

function UpliftStat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider" style={{ color: "#7f9a8f" }}>
        {label}{" "}{note && <span className="opacity-70">({note})</span>}
      </div>
      <div className="font-extrabold tabular mt-1" style={{ fontSize: 17 }}>{value}</div>
    </div>
  );
}

/**
 * Partial-sale sidebar slot.
 *
 * Rendered even when the feature is off — the design change explicitly asked
 * for a "قريبًا" placeholder so certified fractional properties still surface
 * the intent while the licence is pending. The DB columns and /invest route
 * are preserved; only the CTA is disabled.
 */
function PartialSaleSlot() {
  if (features.partialSale) {
    // When the flag flips on, the previous invest CTA should be re-wired.
    // Keeping the "قريبًا" copy here as the fallback avoids a broken CTA on
    // a data hiccup; the actual live experience should be reintroduced then.
    return null;
  }
  return (
    <div
      className="mt-5"
      style={{
        border: "1.5px dashed #cbd8d3",
        borderRadius: 16,
        padding: 18,
        background: "#f8faf9",
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#5b6863" }}>
          بيع جزئي
        </div>
        <span className="chip-warn" style={{ fontSize: 11 }}>قريبًا</span>
      </div>
      <p className="text-muted-2 font-light" style={{ fontSize: 13, lineHeight: 1.75 }}>
        سيُفتح الاستثمار بحصص بعد استكمال الترخيص النظامي اللازم.
      </p>
      <button
        disabled
        className="btn mt-3 w-full"
        style={{
          background: "#e6eae8",
          color: "#7d8a85",
          cursor: "not-allowed",
          padding: "10px 16px",
          borderRadius: 12,
          fontSize: 13,
        }}
      >
        أبلغني عند الإطلاق
      </button>
    </div>
  );
}
