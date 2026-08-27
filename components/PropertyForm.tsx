"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { ImageUploader } from "./ImageUploader";
import { LocationPicker } from "./LocationPicker";

const STEPS = [
  { n: 1, label: "البيانات الأساسية" },
  { n: 2, label: "الموقع والصور" },
  { n: 3, label: "المراجعة" },
];

export function PropertyForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [attestOwner, setAttestOwner] = useState(false);
  const [attestData, setAttestData] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    city: "",
    district: "",
    address: "",
    propertyType: "APARTMENT",
    listingType: "SALE",
    price: "",
    area: "",
    bedrooms: "",
    bathrooms: "",
    yearBuilt: "",
  });

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!attestOwner || !attestData) {
      setError("يجب الإقرار بجميع البنود قبل الحفظ.");
      return;
    }
    setError(null);
    setLoading(true);

    const payload = {
      title: form.title,
      description: form.description,
      city: form.city,
      district: form.district || undefined,
      address: form.address || undefined,
      propertyType: form.propertyType,
      listingType: form.listingType,
      price: Number(form.price),
      area: Number(form.area),
      bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
      bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
      yearBuilt: form.yearBuilt ? Number(form.yearBuilt) : undefined,
      latitude: coords?.lat,
      longitude: coords?.lng,
      images,
      attestation: {
        ownerOrAgent: attestOwner,
        dataAccuracy: attestData,
      },
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
    <div>
      {/* Stepper */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <span
            key={s.n}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition ${
              step === s.n ? "text-white" : "text-muted-2"
            }`}
            style={{
              background: step === s.n ? "#16302a" : "#f5f8f6",
            }}
          >
            <span
              className="grid place-items-center rounded-full text-xs"
              style={{
                width: 22,
                height: 22,
                background: step === s.n ? "#c9a24a" : "#dfe7e3",
                color: step === s.n ? "#16302a" : "#5b6863",
                fontWeight: 800,
              }}
            >
              {s.n}
            </span>
            {s.label}
            {i < STEPS.length - 1 && <span className="mx-1 text-muted">·</span>}
          </span>
        ))}
      </div>

      <form onSubmit={submit} className="card" style={{ padding: 34 }}>
        {step === 1 && (
          <div
            className="grid gap-5"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))" }}
          >
            <div style={{ gridColumn: "1 / -1" }}>
              <label className="label">عنوان العقار</label>
              <input
                className="input"
                required
                minLength={4}
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label className="label">الوصف</label>
              <textarea
                className="input min-h-[120px]"
                required
                minLength={20}
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
              />
            </div>

            <div>
              <label className="label">نوع العقار</label>
              <select
                className="input"
                value={form.propertyType}
                onChange={(e) => update("propertyType", e.target.value)}
              >
                <option value="APARTMENT">شقة</option>
                <option value="VILLA">فيلا</option>
                <option value="LAND">أرض</option>
                <option value="COMMERCIAL">تجاري</option>
                <option value="BUILDING">مبنى</option>
              </select>
            </div>

            <div>
              <label className="label">نوع العرض</label>
              <select
                className="input"
                value={form.listingType}
                onChange={(e) => update("listingType", e.target.value)}
              >
                <option value="SALE">للبيع</option>
                <option value="INVESTMENT">استثمار</option>
              </select>
              <p className="text-xs text-muted mt-2">
                البيع الجزئي غير متاح حاليًا — قيد الترخيص النظامي.
              </p>
            </div>

            <div>
              <label className="label">السعر (ر.س)</label>
              <input
                type="number"
                className="input"
                required
                min="1"
                step="1000"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
              />
            </div>
            <div>
              <label className="label">المساحة (م²)</label>
              <input
                type="number"
                className="input"
                required
                min="1"
                value={form.area}
                onChange={(e) => update("area", e.target.value)}
              />
            </div>
            <div>
              <label className="label">عدد الغرف</label>
              <input
                type="number"
                className="input"
                min="0"
                value={form.bedrooms}
                onChange={(e) => update("bedrooms", e.target.value)}
              />
            </div>
            <div>
              <label className="label">عدد الحمامات</label>
              <input
                type="number"
                className="input"
                min="0"
                value={form.bathrooms}
                onChange={(e) => update("bathrooms", e.target.value)}
              />
            </div>
            <div>
              <label className="label">سنة البناء</label>
              <input
                type="number"
                className="input"
                min="1900"
                max={new Date().getFullYear()}
                value={form.yearBuilt}
                onChange={(e) => update("yearBuilt", e.target.value)}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))" }}>
              <div>
                <label className="label">المدينة</label>
                <input
                  className="input"
                  required
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                />
              </div>
              <div>
                <label className="label">الحي</label>
                <input
                  className="input"
                  value={form.district}
                  onChange={(e) => update("district", e.target.value)}
                />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label className="label">العنوان التفصيلي</label>
                <input
                  className="input"
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="label">صور العقار</label>
              <div
                style={{
                  border: "1.5px dashed #cbd8d3",
                  borderRadius: 16,
                  padding: 24,
                  background: "#fafcfb",
                }}
              >
                <ImageUploader value={images} onChange={setImages} />
                <p className="text-xs text-muted mt-3">
                  تُحوَّل الصور تلقائيًا إلى WebP ويُعاد تحجيمها للأداء.
                </p>
              </div>
            </div>

            <div>
              <label className="label">موقع العقار على الخريطة</label>
              <LocationPicker
                onChange={(lat, lng) => setCoords({ lat, lng })}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-bold" style={{ fontSize: 20 }}>مراجعة وإقرار</h3>
            <div
              className="grid gap-2 text-sm"
              style={{ background: "#f5f8f6", borderRadius: 14, padding: 20 }}
            >
              <Row k="العنوان" v={form.title || "—"} />
              <Row k="النوع / العرض" v={`${form.propertyType} / ${form.listingType}`} />
              <Row k="السعر" v={form.price ? `${Number(form.price).toLocaleString("ar-SA")} ر.س` : "—"} />
              <Row k="المساحة" v={form.area ? `${form.area} م²` : "—"} />
              <Row k="المدينة / الحي" v={`${form.city || "—"}${form.district ? ` — ${form.district}` : ""}`} />
              <Row k="عدد الصور" v={String(images.length)} />
              <Row k="الموقع" v={coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : "غير محدد"} />
            </div>

            <div
              className="rounded-2xl"
              style={{ background: "#f5f8f6", borderRadius: 14, padding: 20 }}
            >
              <label className="flex items-start gap-3 text-sm mb-4">
                <input
                  type="checkbox"
                  checked={attestOwner}
                  onChange={(e) => setAttestOwner(e.target.checked)}
                  style={{ accentColor: "#2f6a53", marginTop: 4 }}
                />
                <span>
                  أُقرّ بأنني <strong>مالك العقار</strong> أو وكيل مفوّض عنه، وأملك حق تسويقه على المنصة.
                </span>
              </label>
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={attestData}
                  onChange={(e) => setAttestData(e.target.checked)}
                  style={{ accentColor: "#2f6a53", marginTop: 4 }}
                />
                <span>
                  أُقرّ بأن جميع البيانات الواردة أعلاه <strong>صحيحة ودقيقة</strong>، وأتحمّل المسؤولية القانونية عن أي معلومات مضلّلة.
                </span>
              </label>
              <p className="text-xs text-muted mt-4">
                يُسجَّل هذا الإقرار مع التاريخ وعنوان IP في سجل التدقيق.{" "}
                <Link href="/legal/terms" className="underline">الشروط والأحكام</Link>
              </p>
            </div>
          </div>
        )}

        {error && <div className="text-sm mt-4" style={{ color: "#b3261e" }}>{error}</div>}

        <div className="flex flex-wrap items-center justify-between gap-3 mt-6">
          {step > 1 ? (
            <button type="button" className="btn-secondary" onClick={() => setStep((s) => (s - 1) as 1 | 2)}>
              ← السابق
            </button>
          ) : (
            <span />
          )}
          {step < 3 ? (
            <button type="button" className="btn-primary" onClick={() => setStep((s) => (s + 1) as 2 | 3)}>
              التالي ←
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading || !attestOwner || !attestData}
              className="btn-primary"
              style={{ opacity: !attestOwner || !attestData ? 0.5 : 1 }}
            >
              {loading ? "جارٍ الحفظ..." : "حفظ العقار"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-muted">{k}</span>
      <span className="font-semibold text-ink">{v}</span>
    </div>
  );
}
