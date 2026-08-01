"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function VerifyEmailPage() {
  const sp = useSearchParams();
  const token = sp.get("token");
  const [state, setState] = useState<"loading" | "ok" | "err">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setState("err");
      setError("رمز التحقق مفقود");
      return;
    }
    (async () => {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (res.ok) setState("ok");
      else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "فشل التحقق");
        setState("err");
      }
    })();
  }, [token]);

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card p-8 text-center">
        {state === "loading" && <div className="text-slate-600">جارٍ التحقق...</div>}
        {state === "ok" && (
          <>
            <div className="text-5xl mb-3">✓</div>
            <h1 className="text-2xl font-bold mb-2">تم التحقق من بريدك</h1>
            <p className="text-slate-600 mb-6">أصبح حسابك مفعّلًا بالكامل.</p>
            <Link href="/dashboard" className="btn-primary">
              الذهاب إلى لوحة التحكم
            </Link>
          </>
        )}
        {state === "err" && (
          <>
            <div className="text-5xl mb-3">✗</div>
            <h1 className="text-2xl font-bold mb-2">فشل التحقق</h1>
            <p className="text-rose-600 mb-6">{error}</p>
            <Link href="/dashboard" className="btn-secondary">
              العودة
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
