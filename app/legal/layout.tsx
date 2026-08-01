import Link from "next/link";

const links = [
  { href: "/legal/terms", label: "الشروط والأحكام" },
  { href: "/legal/privacy", label: "سياسة الخصوصية" },
  { href: "/legal/cookies", label: "سياسة الكوكيز" },
  { href: "/legal/aml", label: "مكافحة غسل الأموال (AML)" },
  { href: "/legal/refund", label: "سياسة الاسترداد" },
  { href: "/legal/disclaimer", label: "إخلاء المسؤولية الاستثمارية" },
];

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10 grid gap-8 md:grid-cols-[240px_1fr]">
      <aside>
        <div className="card p-4 sticky top-20">
          <div className="font-bold mb-3 text-slate-700">المستندات القانونية</div>
          <nav className="space-y-1 text-sm">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="block px-3 py-2 rounded hover:bg-slate-100"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 rounded bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
            ⚠️ هذه المستندات نماذج مبدئية. يجب مراجعتها واعتمادها من مستشار
            قانوني سعودي قبل الإطلاق التجاري.
          </div>
        </div>
      </aside>
      <article className="card p-8 prose prose-slate max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-xl prose-h2:mt-8 prose-p:leading-relaxed">
        {children}
      </article>
    </div>
  );
}
