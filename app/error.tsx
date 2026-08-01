"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("Route error", error);
  }, [error]);

  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <div className="text-7xl font-black text-rose-600 mb-2">500</div>
      <h1 className="text-2xl font-bold mb-3">حدث خطأ غير متوقع</h1>
      <p className="text-slate-600 mb-2">نأسف على الإزعاج. يرجى المحاولة مجددًا.</p>
      {error.digest && (
        <p className="text-xs text-slate-400 font-mono mb-6">ref: {error.digest}</p>
      )}
      <div className="flex gap-2 justify-center">
        <button onClick={() => reset()} className="btn-primary">
          إعادة المحاولة
        </button>
        <Link href="/" className="btn-secondary">
          الرئيسية
        </Link>
      </div>
    </div>
  );
}
