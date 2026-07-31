import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "عقار مدر — منصة الاستثمار العقاري المعتمدة هندسيًا",
  description:
    "استثمر في عقار موثوق، معتمد هندسيًا من العراب. تقارير فنية شاملة وفرص تطوير عقاري ذكية.",
  keywords: [
    "عقار",
    "استثمار عقاري",
    "السعودية",
    "الرياض",
    "تقرير هندسي",
    "Alarrab",
    "عقار مدر",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
