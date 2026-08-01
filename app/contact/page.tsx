export const metadata = { title: "تواصل معنا — عقار مدر" };

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-2">تواصل معنا</h1>
      <p className="text-slate-600 mb-8">
        نحن هنا للإجابة على استفساراتك. اختر القناة الأنسب:
      </p>
      <div className="grid gap-4">
        {[
          { t: "استفسارات عامة", e: "info@aqarmudar.sa" },
          { t: "الدعم الفني", e: "support@aqarmudar.sa" },
          { t: "قانوني", e: "legal@aqarmudar.sa" },
          { t: "خصوصية البيانات", e: "privacy@aqarmudar.sa" },
          { t: "الالتزام و AML", e: "compliance@aqarmudar.sa" },
          { t: "استرداد المدفوعات", e: "refunds@aqarmudar.sa" },
        ].map((c) => (
          <div key={c.e} className="card p-5 flex items-center justify-between">
            <div>
              <div className="font-semibold">{c.t}</div>
              <div className="text-sm text-slate-500 mt-1">{c.e}</div>
            </div>
            <a href={`mailto:${c.e}`} className="btn-secondary">
              راسلنا
            </a>
          </div>
        ))}
      </div>
      <div className="card p-5 mt-6 text-sm text-slate-600">
        <div className="font-semibold text-slate-900 mb-1">العنوان</div>
        الرياض، المملكة العربية السعودية
      </div>
    </div>
  );
}
