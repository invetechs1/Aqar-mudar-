import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PropertyCard } from "@/components/PropertyCard";

export const dynamic = "force-dynamic";

type Search = {
  city?: string;
  type?: string;
  listing?: string;
  certified?: string;
};

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const properties = await prisma.property.findMany({
    where: {
      ...(searchParams.city && { city: searchParams.city }),
      ...(searchParams.type && { propertyType: searchParams.type }),
      ...(searchParams.listing && { listingType: searchParams.listing }),
      ...(searchParams.certified === "1" && { isCertified: true }),
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">العقارات المتاحة</h1>
          <p className="text-slate-600 mt-1">
            {properties.length} عقار{" "}
            {searchParams.certified === "1" ? "معتمد هندسيًا" : ""}
          </p>
        </div>
        <Link href="/properties/new" className="btn-primary hidden md:inline-flex">
          + إضافة عقار
        </Link>
      </div>

      <form className="card p-4 mb-8 grid gap-3 sm:grid-cols-5" method="get">
        <select name="city" className="input" defaultValue={searchParams.city ?? ""}>
          <option value="">كل المدن</option>
          <option value="الرياض">الرياض</option>
          <option value="جدة">جدة</option>
          <option value="الدمام">الدمام</option>
          <option value="مكة">مكة</option>
        </select>
        <select name="type" className="input" defaultValue={searchParams.type ?? ""}>
          <option value="">كل الأنواع</option>
          <option value="APARTMENT">شقة</option>
          <option value="VILLA">فيلا</option>
          <option value="LAND">أرض</option>
          <option value="COMMERCIAL">تجاري</option>
          <option value="BUILDING">مبنى</option>
        </select>
        <select name="listing" className="input" defaultValue={searchParams.listing ?? ""}>
          <option value="">نوع العرض</option>
          <option value="SALE">للبيع</option>
          <option value="PARTIAL_SALE">بيع جزئي</option>
          <option value="INVESTMENT">استثمار</option>
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="certified"
            value="1"
            defaultChecked={searchParams.certified === "1"}
            className="w-4 h-4"
          />
          معتمد فقط
        </label>
        <button className="btn-primary" type="submit">
          تطبيق
        </button>
      </form>

      {properties.length === 0 ? (
        <div className="card p-10 text-center text-slate-600">
          لا توجد عقارات مطابقة للبحث.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      )}
    </div>
  );
}
