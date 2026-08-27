"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * The eight acknowledgement clauses are the canonical list — do not merge them
 * client-side into a single boolean. Each is submitted as its own consent row.
 * If you add or rename a clause here, mirror it in lib/consent.ts
 * `REQUIRED_CLAUSES.INVEST_ACK`, and re-prompt existing users.
 */
type Clause = {
  key: string;
  documentSlug?: "terms" | "privacy" | "disclaimer" | "risk";
  text: React.ReactNode;
};

const CLAUSES: Clause[] = [
  {
    key: "read_terms",
    documentSlug: "terms",
    text: (
      <>
        قرأتُ ووافقتُ على{" "}
        <Link href="/legal/terms" className="underline text-green-700">الشروط والأحكام</Link>.
      </>
    ),
  },
  {
    key: "read_privacy",
    documentSlug: "privacy",
    text: (
      <>
        قرأتُ ووافقتُ على{" "}
        <Link href="/legal/privacy" className="underline text-green-700">سياسة الخصوصية (PDPL)</Link>.
      </>
    ),
  },
  {
    key: "read_disclaimer",
    documentSlug: "disclaimer",
    text: (
      <>
        قرأتُ ووافقتُ على{" "}
        <Link href="/legal/disclaimer" className="underline text-green-700">إخلاء المسؤولية</Link>.
      </>
    ),
  },
  {
    key: "read_risk",
    documentSlug: "risk",
    text: (
      <>
        قرأتُ ووافقتُ على{" "}
        <Link href="/legal/risk" className="underline text-green-700">إفصاح مخاطر الاستثمار</Link>.
      </>
    ),
  },
  {
    key: "capital_loss",
    text: <>أُقرّ بأنني قد أخسر جزءًا أو كامل رأس المال المستثمر.</>,
  },
  {
    key: "estimates_not_guaranteed",
    text: <>أُقرّ بأن العوائد وفرص رفع القيمة والعمر الافتراضي تقديرات وليست ضمانات.</>,
  },
  {
    key: "report_scope",
    text: (
      <>
        أُقرّ بأن التقرير الهندسي يُصدره Alarrab Engineering &amp; Partner بناءً على معاينة في تاريخ محدد،
        وأن مسؤولية المنصة تقتصر على ما ورد في نطاق التقرير.
      </>
    ),
  },
  {
    key: "no_platform_advice",
    text: <>أُقرّ بأن محتوى المنصة معلوماتي ولا يُعدّ استشارة مالية أو قانونية.</>,
  },
  {
    key: "independent_inspection",
    text: <>أُقرّ بحقّي في إجراء فحص مستقل للعقار قبل الاستثمار.</>,
  },
  {
    key: "source_of_funds",
    text: (
      <>
        أُقرّ بأن مصدر الأموال مشروع، وألتزم بمتطلبات مكافحة غسل الأموال (AML) وتقديم المستندات عند الطلب.
      </>
    ),
  },
  {
    key: "electronic_logging",
    text: <>أوافق على تسجيل هذه الإقرارات إلكترونيًا مع التاريخ وعنوان IP.</>,
  },
];

export function AcknowledgeForm({ propertyId }: { propertyId: string }) {
  const router = useRouter();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allChecked = CLAUSES.every((c) => checked[c.key]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!allChecked) return;
    setBusy(true);
    setError(null);
    const res = await fetch("/api/consent/invest", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        propertyId,
        clauses: CLAUSES.map((c) => ({ key: c.key, documentSlug: c.documentSlug })),
      }),
    });
    if (res.ok) {
      router.push(`/properties/${propertyId}/invest`);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "فشل تسجيل الإقرار");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6">
      <div>
        {CLAUSES.map((c, i) => (
          <label
            key={c.key}
            className="flex items-start gap-3"
            style={{
              padding: "16px 0",
              borderTop: i === 0 ? "none" : "1px solid #f2f5f4",
              fontSize: 14,
              lineHeight: 1.9,
            }}
          >
            <input
              type="checkbox"
              checked={!!checked[c.key]}
              onChange={(e) =>
                setChecked((s) => ({ ...s, [c.key]: e.target.checked }))
              }
              style={{ accentColor: "#2f6a53", width: 19, height: 19, marginTop: 3, flex: "none" }}
            />
            <span className="text-muted-2">{c.text}</span>
          </label>
        ))}
      </div>

      {error && <div className="text-sm mt-3" style={{ color: "#b3261e" }}>{error}</div>}

      <div className="flex flex-wrap items-center justify-between gap-3 mt-6">
        <Link href={`/properties/${propertyId}`} className="btn-secondary">
          إلغاء
        </Link>
        <button
          type="submit"
          disabled={!allChecked || busy}
          className="btn-primary"
          style={{ opacity: allChecked ? 1 : 0.5 }}
        >
          {busy ? "جارٍ التسجيل..." : "أُقرّ وأتابع ←"}
        </button>
      </div>
      <p className="text-xs text-muted mt-4">
        يُسجَّل كل بند كسجلّ قانوني مستقل. لن تُقبل عملية الاستثمار قبل استكمال جميع الإقرارات.
      </p>
    </form>
  );
}
