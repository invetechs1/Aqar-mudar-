"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function LocaleSwitcher({ current }: { current: "ar" | "en" }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function switchTo(locale: "ar" | "en") {
    if (locale === current) return;
    start(async () => {
      await fetch("/api/locale", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ locale }),
      });
      router.refresh();
    });
  }

  const base =
    "px-3 py-1.5 text-xs font-semibold transition uppercase tracking-wide";

  return (
    <div
      className="inline-flex overflow-hidden"
      style={{
        border: "1px solid rgba(255,255,255,.22)",
        borderRadius: 999,
      }}
    >
      <button
        type="button"
        onClick={() => switchTo("ar")}
        disabled={pending}
        className={base}
        style={{
          background: current === "ar" ? "#c9a24a" : "transparent",
          color: current === "ar" ? "#16302a" : "rgba(255,255,255,.85)",
        }}
      >
        عربي
      </button>
      <button
        type="button"
        onClick={() => switchTo("en")}
        disabled={pending}
        className={base}
        style={{
          background: current === "en" ? "#c9a24a" : "transparent",
          color: current === "en" ? "#16302a" : "rgba(255,255,255,.85)",
        }}
      >
        EN
      </button>
    </div>
  );
}
