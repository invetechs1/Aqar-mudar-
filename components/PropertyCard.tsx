import Link from "next/link";
import { formatSAR, PROPERTY_TYPE_AR, LISTING_AR } from "@/lib/format";

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
    images: unknown;
  };
};

export function PropertyCard({ property }: Props) {
  const images: string[] = Array.isArray(property.images)
    ? (property.images as string[])
    : [];
  const cover = images[0] ?? "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800";

  return (
    <Link
      href={`/properties/${property.id}`}
      className="card group block overflow-hidden transition"
      style={{
        borderRadius: 20,
      }}
    >
      <div className="relative" style={{ aspectRatio: "4/3", overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cover}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
        />
        <div
          className="absolute top-3 flex gap-1.5"
          style={{ insetInlineStart: "auto", insetInlineEnd: 12 }}
        >
          {property.isCertified && (
            <span className="chip-certified">✓ العراب Certified</span>
          )}
          <span className="chip-listing">
            {LISTING_AR[property.listingType] ?? property.listingType}
          </span>
        </div>
      </div>
      <div className="p-6">
        <h3 className="font-bold text-ink line-clamp-1" style={{ fontSize: 18 }}>
          {property.title}
        </h3>
        <div className="text-muted mt-1.5" style={{ fontSize: 13 }}>
          {PROPERTY_TYPE_AR[property.propertyType] ?? property.propertyType} — {property.city}
          {property.district ? ` · ${property.district}` : ""}
        </div>
        <div
          className="flex items-center justify-between mt-4 pt-4"
          style={{ borderTop: "1px solid #eef2f0" }}
        >
          <div className="tabular" style={{ color: "#2f6a53", fontSize: 21, fontWeight: 800, letterSpacing: "-0.01em" }}>
            {formatSAR(property.price)}
          </div>
          <div className="text-muted tabular" style={{ fontSize: 13 }}>
            {property.area} م²{property.bedrooms ? ` · ${property.bedrooms} غرف` : ""}
          </div>
        </div>
      </div>
      <style>{`
        .group:hover { box-shadow: 0 16px 40px rgba(22,48,42,.13); border-color: #d7dedb; }
      `}</style>
    </Link>
  );
}
