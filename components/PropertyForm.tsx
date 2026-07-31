"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ImageUploader } from "./ImageUploader";
import { LocationPicker } from "./LocationPicker";

export function PropertyForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);

    const payload = {
      title: String(fd.get("title") ?? ""),
      description: String(fd.get("description") ?? ""),
      city: String(fd.get("city") ?? ""),
      district: String(fd.get("district") ?? "") || undefined,
      address: String(fd.get("address") ?? "") || undefined,
      propertyType: String(fd.get("propertyType") ?? ""),
      listingType: String(fd.get("listingType") ?? ""),
      price: Number(fd.get("price")),
      area: Number(fd.get("area")),
      bedrooms: fd.get("bedrooms") ? Number(fd.get("bedrooms")) : undefined,
      bathrooms: fd.get("bathrooms") ? Number(fd.get("bathrooms")) : undefined,
      yearBuilt: fd.get("yearBuilt") ? Number(fd.get("yearBuilt")) : undefined,
      latitude: coords?.lat,
      longitude: coords?.lng,
      images,
    };

    const res = await fetch("/api/properties", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      router.push(`/properties/${data.property.id}`);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "فشل إنشاء العقار");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="card p-6 space-y-5">
      <div>
        <label className="label">عنوان العقار</label>
        <input name="title" className="input" required minLength={4} />
      </div>

      <div>
        <label className="label">الوصف</label>
        <textarea name="description" className="input min-h-[120px]" required minLength={20} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">نوع العقار</label>
          <select name="propertyType" className="input" required>
            <option value="APARTMENT">شقة</option>
            <option value="VILLA">فيلا</option>
            <option value="LAND">أرض</option>
            <option value="COMMERCIAL">تجاري</option>
            <option value="BUILDING">مبنى</option>
          </select>
        </div>
        <div>
          <label className="label">نوع العرض</label>
          <select name="listingType" className="input" required>
            <option value="SALE">للبيع</option>
            <option value="PARTIAL_SALE">بيع جزئي</option>
            <option value="INVESTMENT">استثمار</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label">المدينة</label>
          <input name="city" className="input" required />
        </div>
        <div>
          <label className="label">الحي</label>
          <input name="district" className="input" />
        </div>
        <div>
          <label className="label">العنوان التفصيلي</label>
          <input name="address" className="input" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">السعر (ر.س)</label>
          <input name="price" type="number" min="1" step="1000" className="input" required />
        </div>
        <div>
          <label className="label">المساحة (م²)</label>
          <input name="area" type="number" min="1" step="1" className="input" required />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label">عدد الغرف</label>
          <input name="bedrooms" type="number" min="0" className="input" />
        </div>
        <div>
          <label className="label">عدد الحمامات</label>
          <input name="bathrooms" type="number" min="0" className="input" />
        </div>
        <div>
          <label className="label">سنة البناء</label>
          <input name="yearBuilt" type="number" min="1900" max={new Date().getFullYear()} className="input" />
        </div>
      </div>

      <div>
        <label className="label">صور العقار</label>
        <ImageUploader value={images} onChange={setImages} />
      </div>

      <div>
        <label className="label">موقع العقار على الخريطة</label>
        <LocationPicker
          onChange={(lat, lng) => setCoords({ lat, lng })}
        />
      </div>

      {error && <div className="text-sm text-rose-600">{error}</div>}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "جارٍ الحفظ..." : "إنشاء العقار"}
      </button>
    </form>
  );
}
