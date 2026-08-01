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
      <Row
        title="البريد الإلكتروني"
        subtitle={props.email}
        verified={props.emailVerified}
        badge={props.emailVerified ? "مؤكد" : "غير مؤكد"}
      />
      <PhoneRow phone={props.phone} verified={props.phoneVerified} />
      <NafathRow verified={props.nafathVerified} ready={props.nafathReady} />
      <TotpRow enabled={props.totpEnabled} />
    </div>
  );
}

function Row({
  title,
  subtitle,
  verified,
  badge,
  children,
}: {
  title: string;
  subtitle?: string | null;
  verified: boolean;
  badge: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="font-bold">{title}</div>
          {subtitle && <div className="text-sm text-slate-500">{subtitle}</div>}
        </div>
        <span className={verified ? "badge-certified" : "badge-pending"}>
          {verified ? "✓ " : ""}
          {badge}
        </span>
      </div>
      {children}
    </div>
  );
}

function PhoneRow({ phone, verified }: { phone: string | null; verified: boolean }) {
  const [p, setP] = useState(phone ?? "");
  const [code, setCode] = useState("");
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

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/auth/phone/verify-otp", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setMsg("تم التحقق. حدّث الصفحة للتحديث.");
    } else setMsg(data.error ?? "فشل");
    setBusy(false);
  }

  return (
    <Row title="رقم الجوال" subtitle={phone ?? "غير مضاف"} verified={verified} badge={verified ? "مؤكد" : "غير مؤكد"}>
      {!verified && (
        <div className="space-y-3">
          {step === "idle" ? (
            <form onSubmit={send} className="flex gap-2">
              <input
                className="input flex-1"
                value={p}
                onChange={(e) => setP(e.target.value)}
                placeholder="+9665xxxxxxxx"
              />
              <button className="btn-primary" disabled={busy}>
                إرسال OTP
              </button>
            </form>
          ) : (
            <form onSubmit={verify} className="flex gap-2">
              <input
                className="input flex-1 font-mono tracking-widest text-center"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                placeholder="000000"
              />
              <button className="btn-primary" disabled={busy}>
                تحقق
              </button>
            </form>
          )}
          {msg && <div className="text-sm text-slate-600">{msg}</div>}
        </div>
      )}
    </Row>
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
    if (res.ok && data.verified) {
      setMsg("تم التحقق عبر نفاذ. حدّث الصفحة.");
    } else setMsg(data.message ?? data.error ?? "لم يتم التحقق بعد");
    setBusy(false);
  }

  return (
    <Row title="نفاذ — التحقق من الهوية" verified={verified} badge={verified ? "مؤكد" : "غير مؤكد"}>
      {!verified && (
        <div className="space-y-3">
          {!ready && (
            <div className="rounded bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
              نفاذ يعمل في وضع المحاكاة (Mock). لا يتم التحقق الفعلي حتى تُهيّئ
              <code className="mx-1">NAFATH_API_URL</code> و <code>NAFATH_CLIENT_ID</code>.
            </div>
          )}
          {!tx ? (
            <form onSubmit={req} className="flex gap-2">
              <input
                className="input flex-1 font-mono"
                value={nid}
                onChange={(e) => setNid(e.target.value)}
                pattern="\d{10}"
                maxLength={10}
                placeholder="رقم الهوية / الإقامة"
              />
              <button className="btn-primary" disabled={busy}>
                طلب تحقق
              </button>
            </form>
          ) : (
            <div className="rounded bg-brand-50 border border-brand-200 p-4">
              <div className="text-sm mb-2">
                افتح تطبيق نفاذ واختر الرقم التالي:
              </div>
              <div className="text-4xl font-black text-center text-brand-700 my-3">
                {tx.randomNumber}
              </div>
              <button onClick={check} className="btn-primary w-full" disabled={busy}>
                تحققت من التطبيق — أكمل
              </button>
            </div>
          )}
          {msg && <div className="text-sm text-slate-600">{msg}</div>}
        </div>
      )}
    </Row>
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
    <Row title="المصادقة الثنائية (2FA)" verified={enabled} badge={enabled ? "مفعّلة" : "غير مفعّلة"}>
      {!enabled && (
        <div className="space-y-3">
          {!setup ? (
            <button onClick={begin} className="btn-primary" disabled={busy}>
              بدء التفعيل
            </button>
          ) : (
            <>
              <div className="text-sm text-slate-600">
                أضف الرمز التالي في تطبيق Google Authenticator / Authy:
              </div>
              <div className="rounded bg-slate-50 border border-slate-200 p-3 font-mono text-center text-sm break-all">
                {setup.secret}
              </div>
              <form onSubmit={confirm} className="flex gap-2">
                <input
                  className="input flex-1 font-mono tracking-widest text-center"
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
          {msg && <div className="text-sm text-slate-600">{msg}</div>}
        </div>
      )}
    </Row>
  );
}
