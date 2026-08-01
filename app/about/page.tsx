export const metadata = { title: "عن المنصة — عقار مدر" };

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-4">عن عقار مدر</h1>
      <p className="text-lg text-slate-600 leading-relaxed mb-8">
        "عقار مدر" منصة عقارية سعودية ذكية تهدف إلى إعادة تعريف الثقة والشفافية في
        السوق العقاري من خلال ربط ملاك العقارات، المستثمرين، الاستشاري الهندسي،
        والمقاول ضمن منظومة رقمية متكاملة.
      </p>

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <div className="card p-6">
          <h2 className="font-bold text-xl mb-2">رؤيتنا</h2>
          <p className="text-slate-600">
            أن نكون المنصة العقارية الأكثر موثوقية وشفافية في المملكة، من خلال دمج
            التقنية والهندسة والاستثمار في تجربة واحدة ذكية وآمنة.
          </p>
        </div>
        <div className="card p-6">
          <h2 className="font-bold text-xl mb-2">قيمنا</h2>
          <ul className="text-slate-600 space-y-1">
            <li>الشفافية أولًا</li>
            <li>الموثوقية الهندسية</li>
            <li>حماية المستثمر</li>
            <li>الابتكار المستمر</li>
          </ul>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">شركاؤنا</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {[
          { n: "Alarrab Engineering & Partner", d: "الاعتماد الهندسي وإصدار التقارير الفنية." },
          { n: "Azoom United Contracting", d: "دراسات التطوير والترميم وتنفيذ الأعمال." },
          { n: "First Ex", d: "الجهة المالكة والمشغّلة للمنصة." },
          { n: "Bassir Technology", d: "الشريك التقني." },
        ].map((p) => (
          <div key={p.n} className="card p-5">
            <div className="font-bold mb-1">{p.n}</div>
            <div className="text-sm text-slate-600">{p.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
