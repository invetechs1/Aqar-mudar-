import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Providers } from "@/components/Providers";
import { getLocale, getDictionary } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "عقار مدر — Aqar Mudar",
  description:
    "منصة الاستثمار العقاري المعتمدة هندسيًا. Engineering-certified real-estate investment.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = getLocale();
  const dict = getDictionary(locale);

  return (
    <html lang={locale} dir={dict.dir}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;900&family=Inter:wght@400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header locale={locale} dict={dict} />
            <main className="flex-1">{children}</main>
            <Footer dict={dict} />
          </div>
        </Providers>
      </body>
    </html>
  );
}
