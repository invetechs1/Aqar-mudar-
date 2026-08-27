"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { LogoSignature } from "./Logo";
import { LocaleSwitcher } from "./LocaleSwitcher";
import type { Dictionary, Locale } from "@/lib/i18n";

export function Header({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { data: session, status } = useSession();
  const pathname = usePathname() ?? "/";
  const nav = dict.nav;

  const NavItem = ({ href, label, hash }: { href: string; label: string; hash?: boolean }) => {
    const active = hash ? false : pathname === href;
    return (
      <Link href={href} className={`nav-pill ${active ? "active" : ""}`}>
        {label}
      </Link>
    );
  };

  return (
    <header
      className="sticky top-0 z-40 w-full text-white"
      style={{ background: "#16302a" }}
    >
      <div
        className="mx-auto max-w-page flex flex-wrap items-center gap-4"
        style={{ minHeight: 72, padding: "12px 32px" }}
      >
        <LogoSignature on="dark" size={38} />

        <nav className="flex flex-wrap items-center gap-1 md:ms-6" aria-label="primary">
          <NavItem href="/" label={nav.home} />
          <NavItem href="/properties" label={nav.properties} />
          <NavItem href="/#certified" label={nav.certified} hash />
          <NavItem href="/#about" label={nav.about} hash />
        </nav>

        <div className="ms-auto flex flex-wrap items-center gap-3">
          <LocaleSwitcher current={locale} />
          {status === "loading" ? null : session?.user ? (
            <>
              {(session.user as { role?: string }).role === "ADMIN" && (
                <Link href="/admin" className="nav-pill">{nav.admin}</Link>
              )}
              <Link href="/dashboard" className="btn-outline-light" style={{ padding: "8px 16px" }}>
                {nav.dashboard}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="nav-pill"
              >
                {nav.signout}
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/signin" className="nav-pill">{nav.signin}</Link>
              <Link
                href="/auth/signup"
                className="btn-gold"
                style={{ padding: "8px 18px", fontSize: 14 }}
              >
                {nav.signup}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
