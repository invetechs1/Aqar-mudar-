import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PropertyCard } from "@/components/PropertyCard";
import { features } from "@/lib/features";

export const dynamic = "force-dynamic";

type Search = {
  city?: string;
  type?: string;
  listing?: string;
  certified?: string;
  sort?: string;
};

const CITY_OPTIONS = ["الرياض", "جدة", "الدمام", "الخبر", "مكة"];
const TYPE_OPTIONS = [
  { v: "APARTMENT", l: "شقة" },
  { v: "VILLA", l: "فيلا" },
  { v: "LAND", l: "أرض" },
  { v: "COMMERCIAL", l: "تجاري" },
  { v: "BUILDING", l: "مبنى" },
];
const LISTING_OPTIONS_ALL = [
  { v: "SALE", l: "للبيع" },
  { v: "PARTIAL_SALE", l: "بيع جزئي" },
  { v: "INVESTMENT", l: "استثمار" },
];

export default async function PropertiesPage({ searchParams }: { searchParams: Search }) {
  const listingOptions = features.partialSale
    ? LISTING_OPTIONS_ALL
    : LISTING_OPTIONS_ALL.filter((l) => l.v !== "PARTIAL_SALE");

  // Enforce the feature flag on any deep-linked query string too.
  const effectiveListing =
    !features.partialSale && searchParams.listing === "PARTIAL_SALE"
      ? undefined
      : searchParams.listing;

  // Keep partial-sale listings visible; the sidebar CTA switches to a
  // "قريبًا" state via features.partialSale. Only the filter option is hidden.
  const where = {
    ...(searchParams.city && { city: searchParams.city }),
    ...(searchParams.type && { propertyType: searchParams.type as any }),
    ...(effectiveListing && { listingType: effectiveListing as any }),
    ...(searchParams.certified === "1" && { isCertified: true }),
  };

  const properties = await prisma.property.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const activeFilters: { key: keyof Search; label: string; value: string }[] = [];
  if (searchParams.city) activeFilters.push({ key: "city", label: "المدينة", value: searchParams.city });
  if (searchParams.type) {
    const t = TYPE_OPTIONS.find((x) => x.v === searchParams.type);
    if (t) activeFilters.push({ key: "type", label: "النوع", value: t.l });
  }
  if (effectiveListing) {
    const l = LISTING_OPTIONS_ALL.find((x) => x.v === effectiveListing);
    if (l) activeFilters.push({ key: "listing", label: "العرض", value: l.l });
  }
  if (searchParams.certified === "1") activeFilters.push({ key: "certified", label: "معتمد", value: "فقط" });

  return (
    <div className="mx-auto max-w-page page-x" style={{ padding: "40px 32px 80px" }}>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-extrabold" style={{ fontSize: 38, letterSpacing: "-0.01em" }}>
            العقارات المتاحة
          </h1>
          <p className="mt-2 text-muted-2" style={{ fontSize: 15 }}>
            {properties.length} عقار{" "}
            {searchParams.certified === "1" ? "معتمد هندسيًا" : ""}
          </p>
        </div>
        <Link href="/properties/new" className="btn-primary rounded-full">
          + إضافة عقار
        </Link>
      </div>

      {/* Filter bar */}
      <form
        className="card flex flex-wrap items-end"
        style={{ padding: 12, gap: 10, borderRadius: 18 }}
        method="get"
      >
        <label style={{ flex: "1 1 150px", minWidth: 130 }} className="text-start">
          <span className="label">المدينة</span>
          <select name="city" defaultValue={searchParams.city ?? ""} className="input">
            <option value="">كل المدن</option>
            {CITY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label style={{ flex: "1 1 150px", minWidth: 130 }} className="text-start">
          <span className="label">نوع العقار</span>
          <select name="type" defaultValue={searchParams.type ?? ""} className="input">
            <option value="">كل الأنواع</option>
            {TYPE_OPTIONS.map((t) => (
              <option key={t.v} value={t.v}>
                {t.l}
              </option>
            ))}
          </select>
        </label>

        <label style={{ flex: "1 1 150px", minWidth: 130 }} className="text-start">
          <span className="label">نوع العرض</span>
          <select name="listing" defaultValue={effectiveListing ?? ""} className="input">
            <option value="">الكل</option>
            {listingOptions.map((l) => (
              <option key={l.v} value={l.v}>
                {l.l}
              </option>
            ))}
          </select>
        </label>

        <label
          className="flex items-center gap-2 text-sm"
          style={{ flex: "1 1 auto", padding: "16px 8px" }}
        >
          <input
            type="checkbox"
            name="certified"
            value="1"
            defaultChecked={searchParams.certified === "1"}
            className="w-4 h-4"
            style={{ accentColor: "#2f6a53" }}
          />
          معتمد فقط
        </label>

        <button className="btn-dark" type="submit" style={{ borderRadius: 12 }}>
          تطبيق
        </button>
      </form>

      {(activeFilters.length > 0) && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {activeFilters.map((f) => (
            <span
              key={f.key}
              className={f.key === "certified" ? "chip-certified" : "chip-muted"}
              style={{ fontSize: 12 }}
            >
              {f.label}: {f.value}
            </span>
          ))}
          <Link href="/properties" className="text-xs text-muted-2 underline">
            مسح الكل
          </Link>
          <span className="ms-auto text-xs text-muted">ترتيب: الأحدث</span>
        </div>
      )}

      <div
        className="grid gap-6 mt-8"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))" }}
      >
        {properties.length === 0 ? (
          <div className="card p-10 text-center text-muted-2 col-span-full">
            لا توجد عقارات مطابقة للبحث.
          </div>
        ) : (
          properties.map((p) => <PropertyCard key={p.id} property={p} />)
        )}
      </div>
    </div>
  );
}
