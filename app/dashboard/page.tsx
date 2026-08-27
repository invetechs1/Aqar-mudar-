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

  const [me, properties, inquiries] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true, role: true,
        emailVerified: true, phoneVerified: true, nafathVerified: true,
      },
    }),
    prisma.property.findMany({
      where: { ownerId: session.user.id },
      include: { report: true, _count: { select: { inquiries: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.inquiry.findMany({
      where: { property: { ownerId: session.user.id } },
      include: { property: { select: { id: true, title: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const stats = {
    total: properties.length,
    certified: properties.filter((p) => p.isCertified).length,
    pending: properties.filter((p) => !p.isCertified).length,
    inquiries: inquiries.length,
  };

  const kycComplete = !!(me?.emailVerified && me?.phoneVerified && me?.nafathVerified);

  return (
    <div className="mx-auto max-w-page page-x" style={{ padding: "40px 32px 80px" }}>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-extrabold" style={{ fontSize: 34, letterSpacing: "-0.01em" }}>
            لوحة التحكم
          </h1>
          <p className="mt-1 text-muted-2" style={{ fontSize: 15 }}>
            مرحبًا {me?.name} — دورك: {me?.role}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/verify" className="btn-secondary rounded-full">
            التحقق من الحساب
          </Link>
          <Link href="/properties/new" className="btn-primary rounded-full">
            + إضافة عقار
          </Link>
        </div>
      </div>

      {/* Verification banner (only when KYC is incomplete) */}
      {!kycComplete && (
        <div
          className="panel-dark mb-8 flex flex-wrap items-center gap-5"
          style={{ padding: 24, borderRadius: 20 }}
        >
          <div
            className="grid place-items-center flex-none text-lg font-bold"
            style={{
              width: 40,
              height: 40,
              background: "rgba(201,162,74,.18)",
              color: "#e6c982",
              borderRadius: 12,
            }}
          >
            !
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-bold" style={{ fontSize: 15 }}>
              أكمل التحقق من حسابك لفتح كامل صلاحيات المنصة
            </div>
            <div className="text-sm mt-1" style={{ color: "#b9cfc4" }}>
              التحقق من نفاذ إلزامي قبل أي معاملة استثمارية، والتحقق من الجوال يرفع أمان حسابك.
            </div>
          </div>
          <Link href="/dashboard/verify" className="btn-gold">أكمل التحقق ←</Link>
        </div>
      )}

      {/* Stats */}
      <div
        className="grid gap-4 mb-8"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
      >
        <Stat label="إجمالي العقارات" value={stats.total} />
        <Stat label="عقارات معتمدة" value={stats.certified} tone="brand" />
        <Stat label="قيد المراجعة" value={stats.pending} tone="warn" />
        <Stat label="استفسارات جديدة" value={stats.inquiries} />
      </div>

      {/* Panels */}
      <div
        className="grid gap-6"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))" }}
      >
        <div className="card overflow-hidden">
          <div
            className="flex items-center justify-between"
            style={{ padding: "18px 24px", borderBottom: "1px solid #eef2f0" }}
          >
            <h2 className="font-bold" style={{ fontSize: 16 }}>عقاراتي</h2>
            <Link href="/properties" className="text-xs text-green-700 font-semibold">
              عرض المنصة →
            </Link>
          </div>
          {properties.length === 0 ? (
            <div className="p-10 text-center text-muted-2 text-sm">
              لم تُضِف عقارات بعد.{" "}
              <Link href="/properties/new" className="text-green-700 font-semibold">
                أضف عقارك الأول
              </Link>
            </div>
          ) : (
            <div>
              {properties.map((p) => {
                const imgs = Array.isArray(p.images) ? (p.images as string[]) : [];
                const cover = imgs[0] ?? "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200";
                return (
                  <Link
                    key={p.id}
                    href={`/properties/${p.id}`}
                    className="flex items-center gap-4"
                    style={{ padding: "16px 24px", borderBottom: "1px solid #f0f3f1" }}
                  >
                    <div
                      className="flex-none overflow-hidden"
                      style={{ width: 64, height: 64, borderRadius: 12, background: "#f5f8f6" }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={cover} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-ink truncate" style={{ fontSize: 15 }}>
                        {p.title}
                      </div>
                      <div className="text-xs text-muted mt-1 tabular">
                        {PROPERTY_TYPE_AR[p.propertyType]} · {p.city} · {formatSAR(p.price)}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={p.isCertified ? "chip-ok" : "chip-warn"}>
                        {STATUS_AR[p.status] ?? p.status}
                      </span>
                      <span className="text-xs text-muted tabular">
                        {p._count.inquiries} استفسار
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="card overflow-hidden">
          <div style={{ padding: "18px 24px", borderBottom: "1px solid #eef2f0" }}>
            <h2 className="font-bold" style={{ fontSize: 16 }}>آخر الاستفسارات</h2>
          </div>
          {inquiries.length === 0 ? (
            <div className="p-10 text-center text-muted-2 text-sm">
              لا توجد استفسارات بعد.
            </div>
          ) : (
            <div>
              {inquiries.map((q) => (
                <div
                  key={q.id}
                  style={{ padding: "16px 24px", borderBottom: "1px solid #f0f3f1" }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Link
                      href={`/properties/${q.property.id}`}
                      className="font-semibold text-green-700 hover:underline"
                      style={{ fontSize: 14 }}
                    >
                      {q.property.title}
                    </Link>
                    <span className="text-xs text-muted tabular">
                      {new Date(q.createdAt).toLocaleDateString("ar-SA")}
                    </span>
                  </div>
                  <p className="text-sm text-muted-2 font-light" style={{ lineHeight: 1.7 }}>
                    {q.message}
                  </p>
                  <div className="text-xs text-muted mt-2 tabular">{q.contact}</div>
                </div>
              ))}
            </div>
          )}
        </div>
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
  tone?: "brand" | "warn";
}) {
  const color =
    tone === "brand"
      ? "#2f6a53"
      : tone === "warn"
      ? "#b28a35"
      : "#16211d";
  return (
    <div className="card" style={{ padding: "22px 24px" }}>
      <div className="text-xs text-muted uppercase tracking-wider">{label}</div>
      <div
        className="font-extrabold mt-2 tabular"
        style={{ fontSize: 34, letterSpacing: "-0.02em", color }}
      >
        {value}
      </div>
    </div>
  );
}
