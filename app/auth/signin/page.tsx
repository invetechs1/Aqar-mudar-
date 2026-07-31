"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignInPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const callbackUrl = sp.get("callbackUrl") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (res?.ok) {
      router.push(callbackUrl);
      router.refresh();
    } else {
      setError("بيانات الدخول غير صحيحة");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card p-8">
        <h1 className="text-2xl font-bold mb-2">تسجيل الدخول</h1>
        <p className="text-slate-600 text-sm mb-6">
          مرحبًا بك مجددًا في عقار مدر.
        </p>

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
          <div>
            <label className="label">كلمة المرور</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="text-sm text-rose-600">{error}</div>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "جارٍ الدخول..." : "دخول"}
          </button>
        </form>

        <div className="mt-6 text-sm text-slate-600 text-center">
          ليس لديك حساب؟{" "}
          <Link href="/auth/signup" className="text-brand-700 font-semibold">
            أنشئ حسابًا
          </Link>
        </div>

        <div className="mt-6 rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600">
          <div className="font-semibold mb-1">حسابات تجريبية:</div>
          <div>مالك: owner@aqarmudar.sa</div>
          <div>مستثمر: investor@aqarmudar.sa</div>
          <div>كلمة المرور: password123</div>
        </div>
      </div>
    </div>
  );
}
