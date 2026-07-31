import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatSAR, PROPERTY_TYPE_AR, STATUS_AR } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin?callbackUrl=/admin");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const [pending, certified, users, inquiries] = await Promise.all([
    prisma.property.findMany({
      where: { isCertified: false },
      include: { owner: { select: { name: true, email: true } }, report: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.property.count({ where: { isCertified: true } }),
    prisma.user.count(),
    prisma.inquiry.count(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">لوحة الأدمن</h1>
        <p className="text-slate-600 mt-1">
          إدارة المنصة، اعتماد التقارير الهندسية، ومراقبة النشاط.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="عقارات قيد المراجعة" value={pending.length} tone="amber" />
        <Stat label="عقارات معتمدة" value={certified} tone="brand" />
        <Stat label="إجمالي المستخدمين" value={users} />
        <Stat label="إجمالي الاستفسارات" value={inquiries} />
      </div>

      <div className="card">
        <div className="p-5 border-b border-slate-200">
          <h2 className="font-bold">عقارات بانتظار الاعتماد الهندسي</h2>
        </div>
        {pending.length === 0 ? (
          <div className="p-10 text-center text-slate-600">
            لا توجد عقارات بانتظار المراجعة.
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {pending.map((p) => (
              <div key={p.id} className="p-5 flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{p.title}</div>
                  <div className="text-sm text-slate-500 mt-1">
                    {PROPERTY_TYPE_AR[p.propertyType]} — {p.city} · {formatSAR(p.price)}
                    <span className="mx-2">·</span>
                    مالك: {p.owner.name} ({p.owner.email})
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge-pending">{STATUS_AR[p.status]}</span>
                  <Link
                    href={`/properties/${p.id}`}
                    className="btn-ghost text-sm"
                    target="_blank"
                  >
                    عرض
                  </Link>
                  <Link
                    href={`/admin/properties/${p.id}/certify`}
                    className="btn-primary text-sm"
                  >
                    {p.report ? "تعديل التقرير واعتماد" : "إصدار تقرير + اعتماد"}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "brand" | "amber";
}) {
  const color =
    tone === "brand"
      ? "text-brand-700"
      : tone === "amber"
      ? "text-amber-700"
      : "text-slate-900";
  return (
    <div className="card p-5">
      <div className="text-sm text-slate-500 mb-1">{label}</div>
      <div className={`text-3xl font-black ${color}`}>{value}</div>
    </div>
  );
}
