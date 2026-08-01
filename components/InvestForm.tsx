"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Provider = "moyasar" | "stripe";

const SAR = new Intl.NumberFormat("ar-SA", {
  style: "currency",
  currency: "SAR",
  maximumFractionDigits: 0,
});

export function InvestForm({
  propertyId,
  sharePrice,
  maxShares,
  moyasarAvailable,
  stripeAvailable,
}: {
  propertyId: string;
  sharePrice: number;
  maxShares: number;
  moyasarAvailable: boolean;
  stripeAvailable: boolean;
}) {
  const router = useRouter();
  const [shares, setShares] = useState(1);
  const [provider, setProvider] = useState<Provider>(
    moyasarAvailable ? "moyasar" : "stripe"
  );
  const [state, setState] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<any>(null);

  const total = useMemo(() => shares * sharePrice, [shares, sharePrice]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setState("loading");
    const endpoint =
      provider === "moyasar"
        ? "/api/payments/moyasar/create"
        : "/api/payments/create-intent";
    const res = await fetch(endpoint, {
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
    setPayload({ provider, ...data });
    setState("ok");
  }

  if (state === "ok" && payload) {
    return (
      <div className="card p-6 space-y-4">
        <div className="rounded-lg bg-brand-50 border border-brand-200 p-4">
          <div className="font-semibold text-brand-800 mb-1">تم إنشاء طلب الاستثمار</div>
          <div className="text-sm text-slate-700">المبلغ: {SAR.format(total)}</div>
          <div className="text-xs text-slate-500 mt-1">
            رقم الاستثمار: <code className="font-mono">{payload.investmentId}</code>
          </div>
        </div>
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 text-sm">
          <div className="font-semibold mb-2">إكمال الدفع</div>
          {payload.provider === "moyasar" ? (
            <p className="text-slate-600">
              تم إنشاء عملية دفع Moyasar بمعرّف{" "}
              <code className="font-mono text-xs bg-white px-2 py-0.5 rounded border">
                {payload.paymentId}
              </code>
              . استخدم Moyasar.js Elements في الواجهة أو الجوال بمفتاح النشر أدناه لعرض
              نموذج البطاقة/مدى/Apple Pay وإكمال الدفع.
            </p>
          ) : (
            <p className="text-slate-600">
              استخدم <code>clientSecret</code> مع Stripe Elements لإكمال الدفع.
            </p>
          )}
          <div className="mt-3 rounded bg-white border border-slate-200 p-3 font-mono text-xs break-all">
            {payload.publishableKey ?? payload.clientSecret}
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
          onChange={(e) =>
            setShares(Math.max(1, Math.min(maxShares, Number(e.target.value) || 1)))
          }
          className="input"
        />
        <div className="text-xs text-slate-500 mt-1">حد أقصى: {maxShares} حصة</div>
      </div>

      <div>
        <label className="label">وسيلة الدفع</label>
        <div className="grid grid-cols-2 gap-2">
          <label
            className={`cursor-pointer rounded-lg border p-3 text-sm ${
              provider === "moyasar"
                ? "border-brand-500 bg-brand-50"
                : "border-slate-200"
            } ${!moyasarAvailable ? "opacity-40 cursor-not-allowed" : ""}`}
          >
            <input
              type="radio"
              name="provider"
              value="moyasar"
              checked={provider === "moyasar"}
              disabled={!moyasarAvailable}
              onChange={() => setProvider("moyasar")}
              className="me-2"
            />
            <span className="font-semibold">Moyasar</span>
            <div className="text-xs text-slate-500 mt-1">مدى · Apple Pay · بطاقات</div>
          </label>
          <label
            className={`cursor-pointer rounded-lg border p-3 text-sm ${
              provider === "stripe"
                ? "border-brand-500 bg-brand-50"
                : "border-slate-200"
            } ${!stripeAvailable ? "opacity-40 cursor-not-allowed" : ""}`}
          >
            <input
              type="radio"
              name="provider"
              value="stripe"
              checked={provider === "stripe"}
              disabled={!stripeAvailable}
              onChange={() => setProvider("stripe")}
              className="me-2"
            />
            <span className="font-semibold">Stripe</span>
            <div className="text-xs text-slate-500 mt-1">بطاقات دولية</div>
          </label>
        </div>
      </div>

      <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-600">سعر الحصة</span>
          <span className="font-semibold">{SAR.format(sharePrice)}</span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-600">عدد الحصص</span>
          <span className="font-semibold">× {shares}</span>
        </div>
        <div className="border-t border-slate-200 pt-2 flex justify-between">
          <span className="font-semibold">الإجمالي</span>
          <span className="font-bold text-brand-700 text-lg">{SAR.format(total)}</span>
        </div>
      </div>

      {error && <div className="text-sm text-rose-600">{error}</div>}

      <button
        type="submit"
        disabled={state === "loading" || maxShares === 0 || (!moyasarAvailable && !stripeAvailable)}
        className="btn-primary w-full"
      >
        {state === "loading" ? "جارٍ التحضير..." : `استثمر ${shares} حصة`}
      </button>
    </form>
  );
}
