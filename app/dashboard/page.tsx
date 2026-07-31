import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatSAR, STATUS_AR, PROPERTY_TYPE_AR } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin?callbackUrl=/dashboard");

  const [properties, inquiries] = await Promise.all([
    prisma.property.findMany({
      where: { ownerId: session.user.id },
      include: { report: true, _count: { select: { inquiries: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.inquiry.findMany({
      where: { property: { ownerId: session.user.id } },
      include: { property: { select: { id: true, title: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const stats = {
    total: properties.length,
    certified: properties.filter((p) => p.isCertified).length,
    pending: properties.filter((p) => !p.isCertified).length,
    inquiries: inquiries.length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">لوحة التحكم</h1>
          <p className="text-slate-600 mt-1">
            مرحبًا {session.user.name} — دورك: {session.user.role}
          </p>
        </div>
        <Link href="/properties/new" className="btn-primary">
          + إضافة عقار
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="إجمالي العقارات" value={stats.total} />
        <Stat label="عقارات معتمدة" value={stats.certified} tone="brand" />
        <Stat label="قيد المراجعة" value={stats.pending} tone="amber" />
        <Stat label="استفسارات جديدة" value={stats.inquiries} />
      </div>

      <div className="card">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-bold">عقاراتي</h2>
          <Link href="/properties" className="text-sm text-brand-700">
            عرض المنصة →
          </Link>
        </div>
        {properties.length === 0 ? (
          <div className="p-10 text-center text-slate-600">
            لم تُضِف عقارات بعد.{" "}
            <Link href="/properties/new" className="text-brand-700 font-semibold">
              أضف عقارك الأول
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {properties.map((p) => (
              <div key={p.id} className="p-5 flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/properties/${p.id}`}
                    className="font-semibold hover:text-brand-700"
                  >
                    {p.title}
                  </Link>
                  <div className="text-sm text-slate-500 mt-1">
                    {PROPERTY_TYPE_AR[p.propertyType]} — {p.city} · {formatSAR(p.price)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={
                      p.isCertified
                        ? "badge-certified"
                        : "badge-pending"
                    }
                  >
                    {STATUS_AR[p.status] ?? p.status}
                  </span>
                  <span className="badge bg-slate-100 text-slate-700">
                    {p._count.inquiries} استفسار
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <div className="p-5 border-b border-slate-200">
          <h2 className="font-bold">آخر الاستفسارات</h2>
        </div>
        {inquiries.length === 0 ? (
          <div className="p-10 text-center text-slate-600">لا توجد استفسارات بعد.</div>
        ) : (
          <div className="divide-y divide-slate-200">
            {inquiries.map((q) => (
              <div key={q.id} className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <Link
                    href={`/properties/${q.property.id}`}
                    className="font-semibold text-brand-700 hover:underline"
                  >
                    {q.property.title}
                  </Link>
                  <span className="text-xs text-slate-500">
                    {new Date(q.createdAt).toLocaleDateString("ar-SA")}
                  </span>
                </div>
                <p className="text-sm text-slate-700">{q.message}</p>
                <div className="text-xs text-slate-500 mt-2">تواصل: {q.contact}</div>
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
