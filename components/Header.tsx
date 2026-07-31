"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LocaleSwitcher } from "./LocaleSwitcher";
import type { Dictionary, Locale } from "@/lib/i18n";

export function Header({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { data: session, status } = useSession();
  const nav = dict.nav;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-brand-600 grid place-items-center text-white font-black">
            ع
          </div>
          <div className="leading-tight">
            <div className="font-bold text-slate-900">
              {locale === "ar" ? "عقار مدر" : "Aqar Mudar"}
            </div>
            <div className="text-[10px] text-slate-500">
              {locale === "ar" ? "Aqar Mudar" : "عقار مدر"}
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-sm">
          <Link href="/" className="btn-ghost">{nav.home}</Link>
          <Link href="/properties" className="btn-ghost">{nav.properties}</Link>
          <Link href="/#certified" className="btn-ghost">{nav.certified}</Link>
          <Link href="/#about" className="btn-ghost">{nav.about}</Link>
        </nav>

        <div className="flex items-center gap-2">
          <LocaleSwitcher current={locale} />
          {status === "loading" ? null : session?.user ? (
            <>
              {(session.user as { role?: string }).role === "ADMIN" && (
                <Link href="/admin" className="btn-ghost hidden sm:inline-flex text-brand-700">
                  {nav.admin}
                </Link>
              )}
              <Link href="/dashboard" className="btn-secondary hidden sm:inline-flex">
                {nav.dashboard}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="btn-ghost text-sm"
              >
                {nav.signout}
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/signin" className="btn-ghost">{nav.signin}</Link>
              <Link href="/auth/signup" className="btn-primary">{nav.signup}</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
