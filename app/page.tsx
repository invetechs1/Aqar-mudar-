import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PropertyCard } from "@/components/PropertyCard";

export const revalidate = 30;

export default async function HomePage() {
  const featured = await prisma.property.findMany({
    where: { isCertified: true },
    take: 6,
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-white">
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-28 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-100 text-brand-800 border border-brand-200 px-3 py-1 text-xs font-semibold mb-5">
              <span>✓</span>
              <span>معتمد هندسيًا من العراب</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black leading-tight text-slate-900">
              استثمر في عقار موثوق…
              <br />
              <span className="text-brand-700">قبل أن تستثمر في مجرد إعلان.</span>
            </h1>
            <p className="mt-5 text-slate-600 text-lg leading-relaxed">
              عقار مدر هي منصة عقارية ذكية تربط ملاك العقارات والمستثمرين
              بتقارير هندسية موثوقة وفرص تطوير حقيقية — لاستثمار عقاري شفاف وآمن.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/properties" className="btn-primary">
                تصفح العقارات المعتمدة
              </Link>
              <Link href="/auth/signup" className="btn-secondary">
                سجّل كمالك عقار
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4 max-w-md text-center">
              <div>
                <div className="text-2xl font-bold text-brand-700">100%</div>
                <div className="text-xs text-slate-500">عقارات مفحوصة</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-brand-700">+30</div>
                <div className="text-xs text-slate-500">مؤشر هندسي</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-brand-700">AR/EN</div>
                <div className="text-xs text-slate-500">دعم كامل</div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 shadow-xl overflow-hidden relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200"
                alt="عقار"
                className="w-full h-full object-cover mix-blend-overlay opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-4 right-4 left-4 bg-white/95 backdrop-blur rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-600 text-white grid place-items-center font-bold">
                    ✓
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Alarrab Certified</div>
                    <div className="text-sm font-semibold">
                      اعتماد هندسي احترافي لكل عقار
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="certified" className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-slate-900">لماذا عقار مدر؟</h2>
            <p className="mt-3 text-slate-600">
              نحن لا نعرض أي عقار قبل حصوله على اعتماد هندسي شامل. الشفافية والموثوقية أولويتنا.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                t: "اعتماد هندسي موثوق",
                d: "تقرير فني احترافي يشمل الحالة الإنشائية، جودة التشطيبات، الأنظمة الكهربائية والميكانيكية، ومستوى المخاطر.",
                i: "🏗️",
              },
              {
                t: "رفع القيمة العقارية",
                d: "دراسات تطوير وترميم من Azoom United Contracting مع تكلفة تقديرية وعائد متوقع بعد التطوير.",
                i: "📈",
              },
              {
                t: "شفافية للمستثمر",
                d: "لوحة تحكم ذكية، تقارير حقيقية، مقارنة الفرص، وإدارة الوثائق — كل ما تحتاجه لقرار مبني على بيانات.",
                i: "🛡️",
              },
            ].map((f) => (
              <div key={f.t} className="card p-6">
                <div className="text-3xl mb-3">{f.i}</div>
                <h3 className="font-bold text-lg mb-2">{f.t}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AUDIENCES */}
      <section id="about" className="py-16 bg-slate-100/60">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10">لمن تُقدَّم المنصة؟</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                t: "ملاك العقارات",
                items: [
                  "عرض العقار بطريقة احترافية",
                  "رفع موثوقية العقار عبر الاعتماد الهندسي",
                  "الوصول لمستثمرين جادين",
                ],
              },
              {
                t: "المستثمرون",
                items: [
                  "الوصول لعقارات موثوقة ومعتمدة",
                  "الاطلاع على تقارير هندسية حقيقية",
                  "معرفة المخاطر قبل الاستثمار",
                ],
              },
              {
                t: "المطورون العقاريون",
                items: [
                  "اكتشاف فرص تطوير جاهزة",
                  "دراسة العائد المتوقع قبل الشراء",
                  "تنفيذ الترميمات عبر جهات معتمدة",
                ],
              },
            ].map((a) => (
              <div key={a.t} className="card p-6">
                <h3 className="font-bold text-lg mb-4 text-brand-700">{a.t}</h3>
                <ul className="space-y-2 text-sm">
                  {a.items.map((it) => (
                    <li key={it} className="flex items-start gap-2">
                      <span className="text-brand-600 mt-0.5">•</span>
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED */}
      {featured.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold">عقارات معتمدة</h2>
                <p className="text-slate-600 mt-2">
                  فرص استثمارية موثوقة، مفحوصة هندسيًا وجاهزة للاستثمار.
                </p>
              </div>
              <Link href="/properties" className="btn-secondary hidden md:inline-flex">
                عرض الكل
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="rounded-2xl bg-brand-700 text-white p-10 md:p-14 shadow-xl">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div>
                <h2 className="text-3xl font-bold">اعرض عقارك الآن</h2>
                <p className="mt-3 text-brand-100">
                  انضم إلى قائمة الملاك الذين رفعوا موثوقية عقاراتهم بالاعتماد الهندسي من العراب.
                </p>
              </div>
              <div className="flex md:justify-end">
                <Link
                  href="/auth/signup"
                  className="btn bg-white text-brand-700 hover:bg-brand-50 font-bold"
                >
                  ابدأ الآن مجانًا →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
