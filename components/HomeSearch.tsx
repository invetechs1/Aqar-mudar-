"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { features } from "@/lib/features";

const CITIES = ["الرياض", "جدة", "الدمام", "الخبر", "مكة"];
const TYPES = [
  { v: "APARTMENT", l: "شقة" },
  { v: "VILLA", l: "فيلا" },
  { v: "LAND", l: "أرض" },
  { v: "COMMERCIAL", l: "تجاري" },
  { v: "BUILDING", l: "مبنى" },
];
const LISTINGS_ALL = [
  { v: "SALE", l: "للبيع" },
  { v: "PARTIAL_SALE", l: "بيع جزئي" },
  { v: "INVESTMENT", l: "استثمار" },
];

export function HomeSearch() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  const [listing, setListing] = useState("");

  // Fractional-sale option is hidden until the CMA/SPV licence is in place.
  const listings = features.partialSale
    ? LISTINGS_ALL
    : LISTINGS_ALL.filter((l) => l.v !== "PARTIAL_SALE");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = new URLSearchParams();
    if (city) q.set("city", city);
    if (type) q.set("type", type);
    if (listing) q.set("listing", listing);
    router.push(`/properties${q.toString() ? `?${q.toString()}` : ""}`);
  }

  const cellStyle: React.CSSProperties = {
    flex: "1 1 170px",
    minWidth: 150,
    padding: "8px 14px",
  };

  return (
    <form
      onSubmit={submit}
      className="flex flex-wrap items-stretch bg-white"
      style={{
        borderRadius: 20,
        padding: 14,
        gap: 10,
        boxShadow: "0 24px 60px rgba(0,0,0,.28)",
      }}
    >
      <label style={cellStyle} className="flex-1 min-w-0 text-start">
        <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1">
          المدينة
        </span>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full bg-transparent outline-none text-ink font-semibold"
          style={{ fontSize: 15 }}
        >
          <option value="">كل المدن</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <div style={{ borderInlineEnd: "1px solid #e6eae8" }} />
      <label style={cellStyle} className="flex-1 min-w-0 text-start">
        <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1">
          نوع العقار
        </span>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full bg-transparent outline-none text-ink font-semibold"
          style={{ fontSize: 15 }}
        >
          <option value="">كل الأنواع</option>
          {TYPES.map((t) => (
            <option key={t.v} value={t.v}>
              {t.l}
            </option>
          ))}
        </select>
      </label>
      <div style={{ borderInlineEnd: "1px solid #e6eae8" }} />
      <label style={cellStyle} className="flex-1 min-w-0 text-start">
        <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1">
          نوع العرض
        </span>
        <select
          value={listing}
          onChange={(e) => setListing(e.target.value)}
          className="w-full bg-transparent outline-none text-ink font-semibold"
          style={{ fontSize: 15 }}
        >
          <option value="">الكل</option>
          {listings.map((l) => (
            <option key={l.v} value={l.v}>
              {l.l}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        className="btn-primary"
        style={{ flex: "1 1 auto", minWidth: 160, borderRadius: 14, padding: "14px 22px" }}
      >
        ابحث ←
      </button>
    </form>
  );
}
