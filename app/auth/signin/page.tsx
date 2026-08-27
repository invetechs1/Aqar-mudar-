"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { AuthSplitLayout } from "@/components/AuthSplitLayout";

export default function SignInPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const callbackUrl = sp.get("callbackUrl") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [needsTotp, setNeedsTotp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", {
      email,
      password,
      totp: totp || undefined,
      redirect: false,
    });
    if (res?.ok) {
      router.push(callbackUrl);
      router.refresh();
    } else if (res?.error === "TOTP_REQUIRED") {
      setNeedsTotp(true);
      setError("أدخل رمز التحقق من تطبيق المصادقة (2FA)");
      setLoading(false);
    } else if (res?.error === "TOTP_INVALID") {
      setError("رمز التحقق (2FA) غير صحيح");
      setLoading(false);
    } else {
      setError("بيانات الدخول غير صحيحة");
      setLoading(false);
    }
  }

  return (
    <AuthSplitLayout
      headline="أهلًا بعودتك — سوق عقاري بشفافية مؤسسية."
      sub="ادخل على لوحتك لعرض عقاراتك، متابعة الاستفسارات، والاطلاع على أحدث الفرص المعتمدة."
      points={[
        "تقارير هندسية معتمدة Alarrab Certified.",
        "مدفوعات آمنة عبر Mada / Apple Pay / STC Pay.",
        "تحقق هوية Nafath وحماية بيانات PDPL.",
      ]}
    >
      <h1 className="font-extrabold" style={{ fontSize: 30, letterSpacing: "-0.01em" }}>
        تسجيل الدخول
      </h1>
      <p className="mt-2 text-muted-2" style={{ fontSize: 14 }}>
        مرحبًا بك مجددًا في عقار مدر.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label className="label">البريد الإلكتروني</label>
          <input
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
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
            autoComplete="current-password"
          />
        </div>
        {needsTotp && (
          <div>
            <label className="label">رمز التحقق (2FA)</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              className="input tabular tracking-widest text-center"
              value={totp}
              onChange={(e) => setTotp(e.target.value)}
              autoFocus
            />
          </div>
        )}
        {error && <div className="text-sm" style={{ color: "#b3261e" }}>{error}</div>}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "جارٍ الدخول..." : "دخول"}
        </button>
      </form>

      <div className="mt-4 text-sm text-center">
        <Link href="/auth/forgot-password" className="text-muted hover:text-green-700">
          نسيت كلمة المرور؟
        </Link>
      </div>

      <div className="mt-6 text-sm text-muted-2 text-center">
        ليس لديك حساب؟{" "}
        <Link href="/auth/signup" className="text-green-700 font-semibold">
          أنشئ حسابًا
        </Link>
      </div>

      <div
        className="mt-6 rounded-xl text-xs"
        style={{ background: "#f5f8f6", border: "1px solid #e6eae8", padding: 12, color: "#5b6863" }}
      >
        <div className="font-semibold mb-1 text-ink">حسابات تجريبية:</div>
        <div>admin@aqarmudar.sa / Password123!</div>
        <div>owner@aqarmudar.sa / Password123!</div>
        <div>investor@aqarmudar.sa / Password123!</div>
      </div>
    </AuthSplitLayout>
  );
}
