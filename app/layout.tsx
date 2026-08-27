import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Providers } from "@/components/Providers";
import { Analytics } from "@/components/Analytics";
import { JsonLd } from "@/components/JsonLd";
import { getLocale, getDictionary } from "@/lib/i18n";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXTAUTH_URL),
  title: {
    default: "عقار مدر — Aqar Mudar | منصة الاستثمار العقاري المعتمدة هندسيًا",
    template: "%s | عقار مدر",
  },
  description:
    "منصة الاستثمار العقاري المعتمدة هندسيًا. Engineering-certified real-estate investment in Saudi Arabia.",
  applicationName: "Aqar Mudar",
  authors: [{ name: "First Ex" }],
  keywords: [
    "عقار", "استثمار عقاري", "السعودية", "الرياض", "تقرير هندسي",
    "Alarrab Certified", "عقار مدر", "real estate",
  ],
  openGraph: {
    type: "website",
    siteName: "Aqar Mudar",
    locale: "ar_SA",
    alternateLocale: "en_US",
    title: "عقار مدر — منصة الاستثمار العقاري المعتمدة هندسيًا",
    description: "استثمر في عقار موثوق، معتمد هندسيًا من العراب.",
    url: env.NEXTAUTH_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "عقار مدر — Aqar Mudar",
    description: "منصة الاستثمار العقاري المعتمدة هندسيًا.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#16302a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = getLocale();
  const dict = getDictionary(locale);

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Aqar Mudar",
    alternateName: "عقار مدر",
    url: env.NEXTAUTH_URL,
    logo: `${env.NEXTAUTH_URL}/favicon.ico`,
    description:
      "منصة الاستثمار العقاري المعتمدة هندسيًا في المملكة العربية السعودية.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "الرياض",
      addressCountry: "SA",
    },
    sameAs: [] as string[],
  };

  return (
    <html lang={locale} dir={dict.dir}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;800&display=swap"
          rel="stylesheet"
        />
        <JsonLd data={organizationSchema} />
      </head>
      <body>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header locale={locale} dict={dict} />
            <main className="flex-1">{children}</main>
            <Footer dict={dict} />
          </div>
        </Providers>
        <Analytics gaId={env.NEXT_PUBLIC_GA_ID} />
      </body>
    </html>
  );
}
