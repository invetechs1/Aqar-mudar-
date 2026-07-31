"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export function InvestForm({
  propertyId,
  sharePrice,
  maxShares,
}: {
  propertyId: string;
  sharePrice: number;
  maxShares: number;
}) {
  const router = useRouter();
  const [shares, setShares] = useState(1);
  const [state, setState] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [investmentId, setInvestmentId] = useState<string | null>(null);

  const total = useMemo(() => shares * sharePrice, [shares, sharePrice]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setState("loading");
    const res = await fetch("/api/payments/create-intent", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ propertyId, shares }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "فشل بدء الدفع");
      setState("err");
      return;
    }
    setClientSecret(data.clientSecret);
    setInvestmentId(data.investmentId);
    setState("ok");
  }

  if (state === "ok" && clientSecret) {
    return (
      <div className="card p-6 space-y-4">
        <div className="rounded-lg bg-brand-50 border border-brand-200 p-4">
          <div className="font-semibold text-brand-800 mb-1">
            تم إنشاء طلب استثمار بنجاح
          </div>
          <div className="text-sm text-slate-700">
            رقم الاستثمار: <code className="font-mono">{investmentId}</code>
          </div>
          <div className="text-sm text-slate-700 mt-2">
            المبلغ: {new Intl.NumberFormat("ar-SA", { style: "currency", currency: "SAR", maximumFractionDigits: 0 }).format(total)}
          </div>
        </div>
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 text-sm">
          <div className="font-semibold mb-2">إكمال الدفع</div>
          <p className="text-slate-600 mb-3">
            استخدم <code>clientSecret</code> أدناه مع Stripe Elements في الواجهة أو
            في تطبيق الجوال لإكمال الدفع. بعد نجاح الدفع، سيتم تحديث حالة الاستثمار
            تلقائيًا عبر webhook.
          </p>
          <div className="rounded bg-white border border-slate-200 p-3 font-mono text-xs break-all">
            {clientSecret}
          </div>
        </div>
        <button
          className="btn-secondary w-full"
          onClick={() => router.push(`/properties/${propertyId}`)}
        >
          العودة للعقار
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card p-6 space-y-4">
      <div>
        <label className="label">عدد الحصص</label>
        <input
          type="number"
          min={1}
          max={maxShares}
          value={shares}
          onChange={(e) => setShares(Math.max(1, Math.min(maxShares, Number(e.target.value) || 1)))}
          className="input"
        />
        <div className="text-xs text-slate-500 mt-1">حد أقصى: {maxShares} حصة</div>
      </div>

      <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-600">سعر الحصة</span>
          <span className="font-semibold">
            {new Intl.NumberFormat("ar-SA", { style: "currency", currency: "SAR", maximumFractionDigits: 0 }).format(sharePrice)}
          </span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-600">عدد الحصص</span>
          <span className="font-semibold">× {shares}</span>
        </div>
        <div className="border-t border-slate-200 pt-2 flex justify-between">
          <span className="font-semibold">الإجمالي</span>
          <span className="font-bold text-brand-700 text-lg">
            {new Intl.NumberFormat("ar-SA", { style: "currency", currency: "SAR", maximumFractionDigits: 0 }).format(total)}
          </span>
        </div>
      </div>

      {error && <div className="text-sm text-rose-600">{error}</div>}

      <button
        type="submit"
        disabled={state === "loading" || maxShares === 0}
        className="btn-primary w-full"
      >
        {state === "loading" ? "جارٍ التحضير..." : `استثمر ${shares} حصة`}
      </button>
    </form>
  );
}
