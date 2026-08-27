"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { AuthSplitLayout } from "@/components/AuthSplitLayout";
import { PasswordStrengthMeter } from "@/components/PasswordStrengthMeter";

const ROLES = [
  { v: "OWNER", label: "مالك عقار" },
  { v: "INVESTOR", label: "مستثمر" },
  { v: "DEVELOPER", label: "مطوّر" },
];

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState("OWNER");
  const [password, setPassword] = useState("");
  const [consent, setConsent] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!consent) {
      setError("يجب الموافقة على المستندات النظامية للمتابعة.");
      return;
    }
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    // "DEVELOPER" is mapped to OWNER on the API — the design surfaces it as an
    // intent/label, but we only carry OWNER/INVESTOR/ADMIN in the DB today.
    const apiRole = role === "INVESTOR" ? "INVESTOR" : "OWNER";
    const payload = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      password,
      phone: String(fd.get("phone") ?? "") || undefined,
      role: apiRole,
      consent: {
        terms: true,
        privacy: true,
        disclaimer: true,
      },
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
    <AuthSplitLayout
      headline="استثمر في عقار موثوق، معتمد هندسيًا من العراب."
      sub="منصة عقار مدر تربط الملاك والمستثمرين بتقارير هندسية حقيقية ودراسات تطوير من شركاء معتمدين."
      points={[
        "تقارير هندسية معتمدة Alarrab Certified.",
        "مدفوعات آمنة عبر Mada / Apple Pay / STC Pay.",
        "تحقق هوية Nafath وحماية بيانات PDPL.",
      ]}
    >
      <h1 className="font-extrabold" style={{ fontSize: 30, letterSpacing: "-0.01em" }}>
        إنشاء حساب
      </h1>
      <p className="mt-2 text-muted-2" style={{ fontSize: 14 }}>
        سيصلك رمز تحقق على بريدك وجوالك بعد إنشاء الحساب.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        {/* Role segmented control */}
        <div>
          <div className="label">أنا</div>
          <div
            className="flex p-1 rounded-full"
            style={{ background: "#f5f8f6" }}
          >
            {ROLES.map((r) => (
              <button
                key={r.v}
                type="button"
                onClick={() => setRole(r.v)}
                className="flex-1 px-3 py-2 rounded-full text-sm font-semibold transition"
                style={{
                  background: role === r.v ? "#16302a" : "transparent",
                  color: role === r.v ? "#ffffff" : "#5b6863",
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">الاسم الكامل</label>
          <input name="name" className="input" required minLength={2} />
        </div>
        <div>
          <label className="label">البريد الإلكتروني</label>
          <input name="email" type="email" className="input" required autoComplete="email" />
        </div>
        <div>
          <label className="label">رقم الجوال</label>
          <input name="phone" className="input" placeholder="+9665xxxxxxxx" autoComplete="tel" />
        </div>
        <div>
          <label className="label">كلمة المرور</label>
          <input
            name="password"
            type="password"
            className="input"
            required
            minLength={10}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <PasswordStrengthMeter value={password} />
        </div>

        <label className="flex items-start gap-3 text-sm" style={{ padding: "10px 2px" }}>
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            style={{ accentColor: "#2f6a53", marginTop: 4 }}
          />
          <span className="text-muted-2" style={{ lineHeight: 1.75 }}>
            أوافق على{" "}
            <Link href="/legal/terms" className="underline text-green-700">الشروط والأحكام</Link>،{" "}
            <Link href="/legal/privacy" className="underline text-green-700">سياسة الخصوصية</Link>{" "}
            و{" "}
            <Link href="/legal/disclaimer" className="underline text-green-700">إخلاء المسؤولية</Link>.
          </span>
        </label>

        {error && <div className="text-sm" style={{ color: "#b3261e" }}>{error}</div>}
        <button type="submit" disabled={loading || !consent} className="btn-primary w-full">
          {loading ? "جارٍ الإنشاء..." : "إنشاء الحساب"}
        </button>
      </form>

      <div className="mt-6 text-sm text-muted-2 text-center">
        لديك حساب؟{" "}
        <Link href="/auth/signin" className="text-green-700 font-semibold">
          سجّل الدخول
        </Link>
      </div>
    </AuthSplitLayout>
  );
}
