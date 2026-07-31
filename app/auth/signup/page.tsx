"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      password: String(fd.get("password") ?? ""),
      phone: String(fd.get("phone") ?? "") || undefined,
      role: String(fd.get("role") ?? "OWNER"),
    };

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const login = await signIn("credentials", {
        email: payload.email,
        password: payload.password,
        redirect: false,
      });
      if (login?.ok) {
        router.push("/dashboard");
        router.refresh();
        return;
      }
    }
    const data = await res.json().catch(() => ({}));
    setError(data.error ?? "فشل إنشاء الحساب");
    setLoading(false);
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card p-8">
        <h1 className="text-2xl font-bold mb-2">إنشاء حساب</h1>
        <p className="text-slate-600 text-sm mb-6">
          انضم إلى عقار مدر — منصة العقار المعتمد هندسيًا.
        </p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">الاسم الكامل</label>
            <input name="name" className="input" required minLength={2} />
          </div>
          <div>
            <label className="label">البريد الإلكتروني</label>
            <input name="email" type="email" className="input" required />
          </div>
          <div>
            <label className="label">رقم الجوال</label>
            <input name="phone" className="input" placeholder="05xxxxxxxx" />
          </div>
          <div>
            <label className="label">كلمة المرور</label>
            <input name="password" type="password" className="input" required minLength={6} />
          </div>
          <div>
            <label className="label">أنا</label>
            <select name="role" className="input" defaultValue="OWNER">
              <option value="OWNER">مالك عقار</option>
              <option value="INVESTOR">مستثمر</option>
            </select>
          </div>
          {error && <div className="text-sm text-rose-600">{error}</div>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "جارٍ الإنشاء..." : "إنشاء الحساب"}
          </button>
        </form>

        <div className="mt-6 text-sm text-slate-600 text-center">
          لديك حساب؟{" "}
          <Link href="/auth/signin" className="text-brand-700 font-semibold">
            سجّل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
}
