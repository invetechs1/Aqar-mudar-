import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PropertyCard } from "@/components/PropertyCard";
import { getDictionary } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const dict = getDictionary();
  const featured = await prisma.property.findMany({
    where: { isCertified: true },
    take: 6,
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-white">
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-28 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-100 text-brand-800 border border-brand-200 px-3 py-1 text-xs font-semibold mb-5">
              <span>✓</span>
              <span>{dict.hero.badge}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black leading-tight text-slate-900">
              {dict.hero.titleA}
              <br />
              <span className="text-brand-700">{dict.hero.titleB}</span>
            </h1>
            <p className="mt-5 text-slate-600 text-lg leading-relaxed">
              {dict.hero.subtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/properties" className="btn-primary">
                {dict.hero.ctaBrowse}
              </Link>
              <Link href="/auth/signup" className="btn-secondary">
                {dict.hero.ctaOwner}
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4 max-w-md text-center">
              <div>
                <div className="text-2xl font-bold text-brand-700">100%</div>
                <div className="text-xs text-slate-500">{dict.hero.stats.inspected}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-brand-700">+30</div>
                <div className="text-xs text-slate-500">{dict.hero.stats.indicators}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-brand-700">AR/EN</div>
                <div className="text-xs text-slate-500">{dict.hero.stats.bilingual}</div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 shadow-xl overflow-hidden relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200"
                alt=""
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
                    <div className="text-sm font-semibold">{dict.hero.caption}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="certified" className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-slate-900">{dict.features.title}</h2>
            <p className="mt-3 text-slate-600">{dict.features.subtitle}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {dict.features.items.map((f) => (
              <div key={f.t} className="card p-6">
                <div className="text-3xl mb-3">{f.i}</div>
                <h3 className="font-bold text-lg mb-2">{f.t}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="py-16 bg-slate-100/60">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10">{dict.audiences.title}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {dict.audiences.groups.map((a) => (
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

      {featured.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold">{dict.featured.title}</h2>
                <p className="text-slate-600 mt-2">{dict.featured.subtitle}</p>
              </div>
              <Link href="/properties" className="btn-secondary hidden md:inline-flex">
                {dict.featured.viewAll}
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

      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="rounded-2xl bg-brand-700 text-white p-10 md:p-14 shadow-xl">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div>
                <h2 className="text-3xl font-bold">{dict.cta.title}</h2>
                <p className="mt-3 text-brand-100">{dict.cta.subtitle}</p>
              </div>
              <div className="flex md:justify-end">
                <Link
                  href="/auth/signup"
                  className="btn bg-white text-brand-700 hover:bg-brand-50 font-bold"
                >
                  {dict.cta.button}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
