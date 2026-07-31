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

  return (
    <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white overflow-hidden text-xs">
      <button
        type="button"
        onClick={() => switchTo("ar")}
        disabled={pending}
        className={`px-3 py-1.5 ${
          current === "ar"
            ? "bg-brand-600 text-white"
            : "text-slate-700 hover:bg-slate-50"
        }`}
      >
        العربية
      </button>
      <button
        type="button"
        onClick={() => switchTo("en")}
        disabled={pending}
        className={`px-3 py-1.5 ${
          current === "en"
            ? "bg-brand-600 text-white"
            : "text-slate-700 hover:bg-slate-50"
        }`}
      >
        EN
      </button>
    </div>
  );
}
