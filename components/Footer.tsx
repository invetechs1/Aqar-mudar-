import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";

export function Footer({ dict }: { dict: Dictionary }) {
  const f = dict.footer;
  return (
    <footer className="border-t border-slate-200 bg-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10 grid gap-8 md:grid-cols-4 text-sm">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-brand-600 grid place-items-center text-white font-black">
              ع
            </div>
            <div className="font-bold">Aqar Mudar</div>
          </div>
          <p className="text-slate-600">{f.tag}</p>
        </div>
        <div>
          <div className="font-semibold mb-2">{f.platform}</div>
          <ul className="space-y-1 text-slate-600">
            <li><Link href="/properties" className="hover:text-brand-700">العقارات المتاحة</Link></li>
            <li><Link href="/about" className="hover:text-brand-700">عن المنصة</Link></li>
            <li><Link href="/faq" className="hover:text-brand-700">الأسئلة الشائعة</Link></li>
            <li><Link href="/contact" className="hover:text-brand-700">اتصل بنا</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2">{f.partners}</div>
          <ul className="space-y-1 text-slate-600">
            <li>Alarrab Engineering &amp; Partner</li>
            <li>Azoom United Contracting</li>
            <li>First Ex</li>
            <li>Bassir Technology</li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2">{f.contact}</div>
          <ul className="space-y-1 text-slate-600">
            <li>Riyadh, KSA</li>
            <li>info@aqarmudar.sa</li>
          </ul>
          <div className="font-semibold mt-4 mb-2">قانوني</div>
          <ul className="space-y-1 text-slate-600 text-xs">
            <li><Link href="/legal/terms" className="hover:text-brand-700">الشروط والأحكام</Link></li>
            <li><Link href="/legal/privacy" className="hover:text-brand-700">سياسة الخصوصية</Link></li>
            <li><Link href="/legal/aml" className="hover:text-brand-700">AML/KYC</Link></li>
            <li><Link href="/legal/disclaimer" className="hover:text-brand-700">إخلاء المسؤولية</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} {f.copyright}
      </div>
    </footer>
  );
}
