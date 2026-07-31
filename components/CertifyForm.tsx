"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Report = {
  structuralCondition: string;
  finishingQuality: string;
  electricalCondition: string;
  mechanicalCondition: string;
  riskLevel: string;
  estimatedLifespan: number;
  valueUpliftPotential: number | null;
  upliftScope: string | null;
  upliftCost: number | null;
  upliftDurationMonths: number | null;
  expectedReturnPct: number | null;
  recommendations: string;
} | null;

export function CertifyForm({
  propertyId,
  existing,
}: {
  propertyId: string;
  existing: Report;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      structuralCondition: String(fd.get("structuralCondition")),
      finishingQuality: String(fd.get("finishingQuality")),
      electricalCondition: String(fd.get("electricalCondition")),
      mechanicalCondition: String(fd.get("mechanicalCondition")),
      riskLevel: String(fd.get("riskLevel")),
      estimatedLifespan: Number(fd.get("estimatedLifespan")),
      recommendations: String(fd.get("recommendations")),
      valueUpliftPotential: fd.get("valueUpliftPotential")
        ? Number(fd.get("valueUpliftPotential"))
        : undefined,
      upliftScope: String(fd.get("upliftScope") ?? "") || undefined,
      upliftCost: fd.get("upliftCost") ? Number(fd.get("upliftCost")) : undefined,
      upliftDurationMonths: fd.get("upliftDurationMonths")
        ? Number(fd.get("upliftDurationMonths"))
        : undefined,
      expectedReturnPct: fd.get("expectedReturnPct")
        ? Number(fd.get("expectedReturnPct"))
        : undefined,
    };
    const res = await fetch(`/api/admin/properties/${propertyId}/certify`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      router.push(`/properties/${propertyId}`);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "فشل الاعتماد");
      setLoading(false);
    }
  }

  const conditions = ["EXCELLENT", "GOOD", "FAIR", "POOR"];
  const conditionLabels: Record<string, string> = {
    EXCELLENT: "ممتاز",
    GOOD: "جيد",
    FAIR: "مقبول",
    POOR: "ضعيف",
  };

  return (
    <form onSubmit={submit} className="card p-6 space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          name="structuralCondition"
          label="الحالة الإنشائية"
          options={conditions}
          labels={conditionLabels}
          defaultValue={existing?.structuralCondition ?? "GOOD"}
        />
        <Select
          name="finishingQuality"
          label="جودة التشطيبات"
          options={conditions}
          labels={conditionLabels}
          defaultValue={existing?.finishingQuality ?? "GOOD"}
        />
        <Select
          name="electricalCondition"
          label="الأنظمة الكهربائية"
          options={conditions}
          labels={conditionLabels}
          defaultValue={existing?.electricalCondition ?? "GOOD"}
        />
        <Select
          name="mechanicalCondition"
          label="الأنظمة الميكانيكية"
          options={conditions}
          labels={conditionLabels}
          defaultValue={existing?.mechanicalCondition ?? "GOOD"}
        />
        <Select
          name="riskLevel"
          label="مستوى المخاطر"
          options={["LOW", "MEDIUM", "HIGH"]}
          labels={{ LOW: "منخفض", MEDIUM: "متوسط", HIGH: "مرتفع" }}
          defaultValue={existing?.riskLevel ?? "LOW"}
        />
        <div>
          <label className="label">العمر الافتراضي (سنة)</label>
          <input
            name="estimatedLifespan"
            type="number"
            min="1"
            max="100"
            className="input"
            required
            defaultValue={existing?.estimatedLifespan ?? 40}
          />
        </div>
      </div>

      <div>
        <label className="label">التوصيات الهندسية</label>
        <textarea
          name="recommendations"
          className="input min-h-[120px]"
          required
          defaultValue={existing?.recommendations ?? ""}
        />
      </div>

      <div className="rounded-lg bg-brand-50 border border-brand-200 p-4 space-y-4">
        <div className="font-semibold text-brand-800">
          دراسة رفع القيمة (اختياري)
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">نسبة رفع القيمة المتوقعة (%)</label>
            <input
              name="valueUpliftPotential"
              type="number"
              min="0"
              max="200"
              step="0.1"
              className="input"
              defaultValue={existing?.valueUpliftPotential ?? ""}
            />
          </div>
          <div>
            <label className="label">التكلفة التقديرية (ر.س)</label>
            <input
              name="upliftCost"
              type="number"
              min="0"
              className="input"
              defaultValue={existing?.upliftCost ?? ""}
            />
          </div>
          <div>
            <label className="label">مدة التنفيذ (شهر)</label>
            <input
              name="upliftDurationMonths"
              type="number"
              min="0"
              className="input"
              defaultValue={existing?.upliftDurationMonths ?? ""}
            />
          </div>
          <div>
            <label className="label">العائد المتوقع بعد التطوير (%)</label>
            <input
              name="expectedReturnPct"
              type="number"
              min="0"
              step="0.1"
              className="input"
              defaultValue={existing?.expectedReturnPct ?? ""}
            />
          </div>
        </div>
        <div>
          <label className="label">نطاق الأعمال المقترحة</label>
          <textarea
            name="upliftScope"
            className="input min-h-[80px]"
            defaultValue={existing?.upliftScope ?? ""}
          />
        </div>
      </div>

      {error && <div className="text-sm text-rose-600">{error}</div>}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "جارٍ الاعتماد..." : "✓ اعتماد ونشر العقار"}
      </button>
    </form>
  );
}

function Select({
  name,
  label,
  options,
  labels,
  defaultValue,
}: {
  name: string;
  label: string;
  options: string[];
  labels: Record<string, string>;
  defaultValue: string;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <select name={name} className="input" defaultValue={defaultValue} required>
        {options.map((o) => (
          <option key={o} value={o}>
            {labels[o] ?? o}
          </option>
        ))}
      </select>
    </div>
  );
}
