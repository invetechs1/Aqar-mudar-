import { JsonLd } from "@/components/JsonLd";

export const metadata = { title: "الأسئلة الشائعة — عقار مدر" };

const faqs = [
  {
    q: "ما هو اعتماد العراب (Alarrab Certified)؟",
    a: "اعتماد هندسي احترافي تصدره Alarrab Engineering & Partner بعد فحص شامل للعقار، ويشمل تقريرًا فنيًا يوضح الحالة الإنشائية، جودة التشطيبات، الأنظمة الكهربائية والميكانيكية، مستوى المخاطر، والعمر الافتراضي.",
  },
  {
    q: "هل جميع العقارات على المنصة معتمدة؟",
    a: "نعم. لا يُنشر أي عقار قبل الحصول على اعتماد العراب.",
  },
  {
    q: "ما هو البيع الجزئي؟",
    a: "هو تقسيم ملكية العقار إلى حصص يمكن للمستثمرين شراؤها بمبالغ صغيرة نسبيًا، وفق هيكل قانوني معتمد من الجهات التنظيمية السعودية.",
  },
  {
    q: "هل تدعمون مدى وApple Pay؟",
    a: "نعم، عبر بوابة Moyasar التي تدعم مدى، Apple Pay، STC Pay، والبطاقات الائتمانية.",
  },
  {
    q: "كيف أسترد استثماري؟",
    a: "خلال 14 يومًا من الاستثمار (وفق نظام حماية المستهلك)، يمكنك طلب الاسترداد من صفحة الاستثمار في لوحة التحكم. راجع سياسة الاسترداد للتفاصيل.",
  },
  {
    q: "هل بياناتي آمنة؟",
    a: "نلتزم بنظام حماية البيانات الشخصية السعودي (PDPL)، ونستخدم تشفير TLS، bcrypt لكلمات المرور، مصادقة ثنائية اختيارية، وسجلات تدقيق كاملة.",
  },
  {
    q: "هل أحتاج التحقق عبر نفاذ؟",
    a: "التحقق عبر نفاذ إلزامي للمستثمرين قبل إجراء أي استثمار في البيع الجزئي، ضمن التزاماتنا بمكافحة غسل الأموال.",
  },
];

export default function FAQPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <JsonLd data={jsonLd} />
      <h1 className="text-3xl font-bold mb-8">الأسئلة الشائعة</h1>
      <div className="space-y-3">
        {faqs.map((f, i) => (
          <details key={i} className="card p-5 group">
            <summary className="font-semibold cursor-pointer flex items-center justify-between">
              <span>{f.q}</span>
              <span className="text-brand-600 group-open:rotate-45 transition">+</span>
            </summary>
            <p className="mt-3 text-slate-600 leading-relaxed">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
