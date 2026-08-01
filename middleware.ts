import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = [/^\/$/, /^\/properties(\/.*)?$/, /^\/auth\/.*/, /^\/api\/auth\/.*/, /^\/api\/health$/, /^\/api\/locale$/, /^\/_next\//, /^\/favicon\.ico$/, /^\/uploads\//, /^\/legal\/.*/, /^\/about$/, /^\/contact$/, /^\/faq$/, /^\/sitemap\.xml$/, /^\/robots\.txt$/];

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // ---- Security headers ----
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set(
    "Permissions-Policy",
    "geolocation=(self), camera=(), microphone=(), payment=(self)"
  );
  res.headers.set("X-DNS-Prefetch-Control", "on");
  if (process.env.NODE_ENV === "production") {
    res.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }

  // Relaxed CSP for Next + Leaflet CSS + Google Fonts + OSM tiles + Stripe/Moyasar
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://cdn.moyasar.com https://www.googletagmanager.com https://www.google-analytics.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.tile.openstreetmap.org https://api.stripe.com https://api.moyasar.com https://www.google-analytics.com https://o*.ingest.sentry.io",
    "frame-src https://js.stripe.com https://cdn.moyasar.com",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
  res.headers.set("Content-Security-Policy", csp);

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
