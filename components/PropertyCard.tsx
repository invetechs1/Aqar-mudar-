import Link from "next/link";
import { formatSAR } from "@/lib/format";

type Props = {
  property: {
    id: string;
    title: string;
    city: string;
    district?: string | null;
    price: number;
    area: number;
    bedrooms?: number | null;
    propertyType: string;
    listingType: string;
    isCertified: boolean;
    images: string;
  };
};

const PROPERTY_TYPE_AR: Record<string, string> = {
  APARTMENT: "شقة",
  VILLA: "فيلا",
  LAND: "أرض",
  COMMERCIAL: "تجاري",
  BUILDING: "مبنى",
};

const LISTING_AR: Record<string, string> = {
  SALE: "للبيع",
  PARTIAL_SALE: "بيع جزئي",
  INVESTMENT: "استثمار",
};

export function PropertyCard({ property }: Props) {
  const images: string[] = (() => {
    try {
      return JSON.parse(property.images);
    } catch {
      return [];
    }
  })();
  const cover = images[0] ?? "https://picsum.photos/seed/aqar/800/600";

  return (
    <Link
      href={`/properties/${property.id}`}
      className="card overflow-hidden hover:shadow-md transition group"
    >
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cover}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition"
        />
        <div className="absolute top-2 right-2 flex gap-1">
          {property.isCertified && (
            <span className="badge-certified">✓ العراب Certified</span>
          )}
          <span className="badge bg-white/90 text-slate-700 border border-slate-200">
            {LISTING_AR[property.listingType] ?? property.listingType}
          </span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-slate-900 line-clamp-1">{property.title}</h3>
        </div>
        <div className="text-sm text-slate-600 mb-3">
          {PROPERTY_TYPE_AR[property.propertyType] ?? property.propertyType} — {property.city}
          {property.district ? ` · ${property.district}` : ""}
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="text-brand-700 font-bold text-lg">{formatSAR(property.price)}</div>
          <div className="text-slate-500">
            {property.area} م²{property.bedrooms ? ` · ${property.bedrooms} غرف` : ""}
          </div>
        </div>
      </div>
    </Link>
  );
}
