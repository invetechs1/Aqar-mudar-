"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-brand-600 grid place-items-center text-white font-black">
            ع
          </div>
          <div className="leading-tight">
            <div className="font-bold text-slate-900">عقار مدر</div>
            <div className="text-[10px] text-slate-500">Aqar Mudar</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-sm">
          <Link href="/" className="btn-ghost">الرئيسية</Link>
          <Link href="/properties" className="btn-ghost">العقارات</Link>
          <Link href="/#certified" className="btn-ghost">اعتماد العراب</Link>
          <Link href="/#about" className="btn-ghost">عن المنصة</Link>
        </nav>

        <div className="flex items-center gap-2">
          {status === "loading" ? null : session?.user ? (
            <>
              <Link href="/dashboard" className="btn-secondary hidden sm:inline-flex">
                لوحة التحكم
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="btn-ghost text-sm"
              >
                خروج
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/signin" className="btn-ghost">تسجيل الدخول</Link>
              <Link href="/auth/signup" className="btn-primary">إنشاء حساب</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
