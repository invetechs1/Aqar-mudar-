"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const token = sp.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }
    setError(null);
    setState("loading");
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    if (res.ok) {
      setState("ok");
      setTimeout(() => router.push("/auth/signin"), 1500);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "فشل التغيير");
      setState("err");
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card p-8">
        <h1 className="text-2xl font-bold mb-2">تعيين كلمة مرور جديدة</h1>
        <p className="text-slate-600 text-sm mb-6">
          يجب أن تحتوي على 10 أحرف على الأقل مع حرف كبير وصغير ورقم ورمز.
        </p>

        {state === "ok" ? (
          <div className="rounded-lg bg-brand-50 border border-brand-200 p-4 text-sm text-brand-800">
            تم تغيير كلمة المرور بنجاح. سيتم توجيهك لتسجيل الدخول...
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">كلمة المرور الجديدة</label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={10}
              />
            </div>
            <div>
              <label className="label">تأكيد كلمة المرور</label>
              <input
                type="password"
                className="input"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>
            {error && <div className="text-sm text-rose-600">{error}</div>}
            <button type="submit" disabled={state === "loading"} className="btn-primary w-full">
              {state === "loading" ? "جارٍ التغيير..." : "تعيين كلمة المرور"}
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
