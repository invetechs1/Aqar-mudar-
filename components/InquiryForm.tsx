"use client";

import { useState } from "react";

export function InquiryForm({ propertyId }: { propertyId: string }) {
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setError(null);
    const res = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ propertyId, contact, message }),
    });
    if (res.ok) {
      setState("ok");
      setMessage("");
      setContact("");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "حدث خطأ");
      setState("err");
    }
  }

  if (state === "ok") {
    return (
      <div className="rounded-lg bg-brand-50 border border-brand-200 p-4 text-sm text-brand-800">
        شكرًا لك — تم إرسال الاستفسار وسيتواصل معك المالك قريبًا.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="label">اسمك أو رقم التواصل</label>
        <input
          className="input"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          required
          placeholder="مثال: 05xxxxxxxx"
        />
      </div>
      <div>
        <label className="label">استفسارك</label>
        <textarea
          className="input min-h-[100px]"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          placeholder="أرغب بمعرفة المزيد عن هذا العقار..."
        />
      </div>
      {error && <div className="text-sm text-rose-600">{error}</div>}
      <button
        type="submit"
        disabled={state === "loading"}
        className="btn-primary w-full"
      >
        {state === "loading" ? "جارٍ الإرسال..." : "إرسال استفسار"}
      </button>
    </form>
  );
}
