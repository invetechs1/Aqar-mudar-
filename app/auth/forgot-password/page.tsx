"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ok">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setState("ok");
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card p-8">
        <h1 className="text-2xl font-bold mb-2">استعادة كلمة المرور</h1>
        <p className="text-slate-600 text-sm mb-6">
          أدخل بريدك وسنرسل لك رابط إعادة تعيين كلمة المرور.
        </p>

        {state === "ok" ? (
          <div className="rounded-lg bg-brand-50 border border-brand-200 p-4 text-sm text-brand-800">
            إذا كان البريد مسجّلًا لدينا، ستصلك رسالة قريبًا. تحقّق من صندوق البريد.
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">البريد الإلكتروني</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={state === "loading"} className="btn-primary w-full">
              {state === "loading" ? "جارٍ الإرسال..." : "إرسال الرابط"}
            </button>
          </form>
        )}

        <div className="mt-6 text-sm text-slate-600 text-center">
          <Link href="/auth/signin" className="text-brand-700 font-semibold">
            العودة لتسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
}
