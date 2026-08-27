"use client";

import { useState } from "react";

type Props = {
  email: string;
  phone: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  nafathVerified: boolean;
  totpEnabled: boolean;
  nafathReady: boolean;
};

export function VerifyPanel(props: Props) {
  return (
    <div className="space-y-4">
      <EmailRow email={props.email} verified={props.emailVerified} />
      <PhoneRow phone={props.phone} verified={props.phoneVerified} />
      <NafathRow verified={props.nafathVerified} ready={props.nafathReady} />
      <TotpRow enabled={props.totpEnabled} />
    </div>
  );
}

function StepCard({
  n,
  title,
  subtitle,
  tone,
  status,
  children,
  variant = "light",
}: {
  n: number;
  title: string;
  subtitle?: string;
  tone: "ok" | "warn" | "dark" | "neutral";
  status: string;
  children?: React.ReactNode;
  variant?: "light" | "dark";
}) {
  const bg = variant === "dark" ? "#16302a" : "#ffffff";
  const color = variant === "dark" ? "#ffffff" : "#16211d";
  const tileBg =
    tone === "ok"
      ? "#eaf3ee"
      : tone === "warn"
      ? "#fdf6e6"
      : tone === "dark"
      ? "rgba(201,162,74,.18)"
      : "#f5f8f6";
  const tileFg =
    tone === "ok" ? "#2f6a53" : tone === "warn" ? "#b28a35" : tone === "dark" ? "#e6c982" : "#5b6863";
  const chipClass =
    tone === "ok" ? "chip-ok" : tone === "warn" ? "chip-warn" : tone === "dark" ? "chip-gold" : "chip-muted";
  return (
    <div
      className="rounded-2xl"
      style={{
        background: bg,
        color,
        border: variant === "dark" ? "none" : "1px solid #e6eae8",
        padding: 22,
        boxShadow: variant === "dark" ? "none" : "0 4px 18px rgba(22,48,42,.06)",
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="grid place-items-center flex-none font-extrabold"
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: tileBg,
            color: tileFg,
            fontSize: 20,
          }}
        >
          {n}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div className="font-bold" style={{ fontSize: 16 }}>{title}</div>
            <span className={chipClass}>{status}</span>
          </div>
          {subtitle && (
            <div className="text-sm mt-1" style={{ color: variant === "dark" ? "#b9cfc4" : "#7d8a85" }}>
              {subtitle}
            </div>
          )}
        </div>
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

function EmailRow({ email, verified }: { email: string; verified: boolean }) {
  return (
    <StepCard
      n={1}
      title="البريد الإلكتروني"
      subtitle={email}
      tone="ok"
      status={verified ? "✓ مكتمل" : "غير مؤكد"}
    />
  );
}

function PhoneRow({ phone, verified }: { phone: string | null; verified: boolean }) {
  const [p, setP] = useState(phone ?? "");
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [step, setStep] = useState<"idle" | "sent">("idle");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/auth/phone/send-otp", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ phone: p }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) setStep("sent");
    else setMsg(data.error ?? "فشل");
    setBusy(false);
  }

  async function verify() {
    setBusy(true);
    setMsg(null);
    const joined = code.join("");
    const res = await fetch("/api/auth/phone/verify-otp", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code: joined }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) setMsg("تم التحقق. حدّث الصفحة.");
    else setMsg(data.error ?? "فشل");
    setBusy(false);
  }

  function setDigit(i: number, v: string) {
    const digit = v.replace(/\D/g, "").slice(0, 1);
    const next = [...code];
    next[i] = digit;
    setCode(next);
    if (digit && i < 5) {
      const el = document.querySelector<HTMLInputElement>(`input[data-otp="${i + 1}"]`);
      el?.focus();
    }
  }

  return (
    <StepCard
      n={2}
      title="رقم الجوال"
      subtitle={phone ?? "غير مضاف"}
      tone={verified ? "ok" : "warn"}
      status={verified ? "✓ مكتمل" : "قيد التحقق"}
    >
      {!verified && (
        <div>
          {step === "idle" ? (
            <form onSubmit={send} className="flex flex-wrap items-center gap-2">
              <input
                className="input flex-1"
                style={{ minWidth: 200 }}
                value={p}
                onChange={(e) => setP(e.target.value)}
                placeholder="+9665xxxxxxxx"
              />
              <button className="btn-primary" disabled={busy}>
                إرسال OTP
              </button>
            </form>
          ) : (
            <div>
              <div className="flex gap-2 mb-3 flex-wrap">
                {code.map((d, i) => (
                  <input
                    key={i}
                    data-otp={i}
                    value={d}
                    onChange={(e) => setDigit(i, e.target.value)}
                    className="text-center font-bold tabular"
                    style={{
                      width: 52,
                      height: 58,
                      borderRadius: 12,
                      border: "1.5px solid #dfe7e3",
                      fontSize: 22,
                      background: "#ffffff",
                    }}
                    inputMode="numeric"
                    maxLength={1}
                  />
                ))}
              </div>
              <button className="btn-primary" disabled={busy} onClick={verify}>
                تأكيد
              </button>
            </div>
          )}
          {msg && <div className="text-sm text-muted-2 mt-2">{msg}</div>}
        </div>
      )}
    </StepCard>
  );
}

function NafathRow({ verified, ready }: { verified: boolean; ready: boolean }) {
  const [nid, setNid] = useState("");
  const [tx, setTx] = useState<{ transactionId: string; randomNumber: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function req(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/nafath/request", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ nationalId: nid }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) setTx({ transactionId: data.transactionId, randomNumber: data.randomNumber });
    else setMsg(data.error ?? "فشل");
    setBusy(false);
  }

  async function check() {
    if (!tx) return;
    setBusy(true);
    const res = await fetch("/api/nafath/verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ transactionId: tx.transactionId, nationalId: nid }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.verified) setMsg("تم التحقق عبر نفاذ. حدّث الصفحة.");
    else setMsg(data.message ?? data.error ?? "لم يتم التحقق بعد");
    setBusy(false);
  }

  return (
    <StepCard
      n={3}
      title="نفاذ — التحقق من الهوية"
      subtitle="مطلوب قبل أي معاملة استثمارية على المنصة."
      tone="dark"
      status={verified ? "✓ مكتمل" : "غير مؤكد"}
      variant="dark"
    >
      {!verified && (
        <div>
          {!ready && (
            <div
              className="text-xs rounded-lg mb-3"
              style={{
                background: "rgba(201,162,74,.14)",
                color: "#e6c982",
                padding: "10px 12px",
                border: "1px solid rgba(201,162,74,.24)",
              }}
            >
              نفاذ يعمل في وضع المحاكاة. لا يتم التحقق الفعلي حتى تُهيّئ اعتمادات نفاذ.
            </div>
          )}
          {!tx ? (
            <form onSubmit={req} className="flex flex-wrap items-center gap-2">
              <input
                className="input flex-1 tabular"
                style={{
                  minWidth: 200,
                  background: "rgba(255,255,255,.06)",
                  borderColor: "rgba(255,255,255,.16)",
                  color: "#ffffff",
                }}
                value={nid}
                onChange={(e) => setNid(e.target.value)}
                pattern="\d{10}"
                maxLength={10}
                placeholder="رقم الهوية / الإقامة"
              />
              <button className="btn-gold" disabled={busy}>
                ابدأ التحقق
              </button>
            </form>
          ) : (
            <div>
              <p style={{ color: "#b9cfc4", fontSize: 14 }}>
                افتح تطبيق نفاذ واختر الرقم:
              </p>
              <div
                className="my-3 tabular font-extrabold"
                style={{ fontSize: 26, color: "#e6c982" }}
              >
                {tx.randomNumber}
              </div>
              <button onClick={check} className="btn-gold" disabled={busy}>
                تحققتُ من التطبيق
              </button>
            </div>
          )}
          {msg && <div className="text-sm mt-3" style={{ color: "#b9cfc4" }}>{msg}</div>}
        </div>
      )}
    </StepCard>
  );
}

function TotpRow({ enabled }: { enabled: boolean }) {
  const [setup, setSetup] = useState<{ secret: string; uri: string } | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function begin() {
    setBusy(true);
    const res = await fetch("/api/auth/2fa/setup", { method: "POST" });
    const data = await res.json();
    setSetup(data);
    setBusy(false);
  }
  async function confirm(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch("/api/auth/2fa/enable", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) setMsg("تم تفعيل 2FA. حدّث الصفحة.");
    else setMsg(data.error ?? "فشل");
    setBusy(false);
  }

  return (
    <StepCard
      n={4}
      title="المصادقة الثنائية (2FA)"
      subtitle="طبقة أمان إضافية لحسابك عبر تطبيق مصادقة."
      tone="neutral"
      status={enabled ? "✓ مفعّلة" : "غير مفعّلة"}
    >
      {!enabled && (
        <div>
          {!setup ? (
            <button onClick={begin} className="btn-secondary" disabled={busy}>
              تفعيل
            </button>
          ) : (
            <>
              <div className="text-sm text-muted-2 mb-2">
                أضف الرمز التالي في تطبيق Google Authenticator / Authy:
              </div>
              <div
                className="tabular text-center rounded-lg mb-3"
                style={{ background: "#f5f8f6", padding: 12, border: "1px solid #e6eae8" }}
              >
                {setup.secret}
              </div>
              <form onSubmit={confirm} className="flex gap-2">
                <input
                  className="input flex-1 tabular text-center tracking-widest"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={6}
                  placeholder="000000"
                />
                <button className="btn-primary" disabled={busy}>
                  تأكيد
                </button>
              </form>
            </>
          )}
          {msg && <div className="text-sm text-muted-2 mt-2">{msg}</div>}
        </div>
      )}
    </StepCard>
  );
}
