import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatSAR } from "@/lib/format";
import { getPayment, isMoyasarConfigured } from "@/lib/moyasar";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type Search = { investment?: string; id?: string; status?: string };

export default async function InvestCallbackPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: Search;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect(`/auth/signin`);

  const investmentId = searchParams.investment;
  if (!investmentId) redirect(`/properties/${params.id}`);

  const inv = await prisma.investment.findUnique({
    where: { id: investmentId },
    include: { property: true },
  });
  if (!inv || inv.userId !== session.user.id) redirect(`/properties/${params.id}`);

  // Poll Moyasar for latest status (webhook is authoritative, this is UX).
  if (isMoyasarConfigured() && inv.providerRef && inv.status === "PENDING") {
    try {
      const p = await getPayment(inv.providerRef);
      if (p.status === "paid") {
        await prisma.$transaction([
          prisma.investment.update({
            where: { id: inv.id },
            data: { status: "PAID", paidAt: new Date() },
          }),
          prisma.property.update({
            where: { id: inv.propertyId },
            data: { soldShares: { increment: inv.shares } },
          }),
        ]);
        inv.status = "PAID";
      } else if (p.status === "failed") {
        await prisma.investment.update({
          where: { id: inv.id },
          data: { status: "FAILED" },
        });
        inv.status = "FAILED";
      }
    } catch {}
  }

  const paid = inv.status === "PAID";
  const failed = inv.status === "FAILED";

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <div className="card p-8 text-center">
        <div className="text-5xl mb-3">{paid ? "✓" : failed ? "✗" : "⏳"}</div>
        <h1 className="text-2xl font-bold mb-2">
          {paid ? "تم استلام دفعتك" : failed ? "فشل الدفع" : "جارٍ تأكيد الدفع"}
        </h1>
        <p className="text-slate-600 mb-6">
          {paid
            ? "شكرًا لاستثمارك في عقار مدر. سيصلك إيصال على بريدك الإلكتروني."
            : failed
            ? "لم تتم عملية الدفع. يمكنك المحاولة مجددًا من صفحة الاستثمار."
            : "قد تحتاج لحظات حتى يتم تأكيد الدفع من بوابة الدفع."}
        </p>
        <div className="grid grid-cols-2 gap-3 text-sm mb-6">
          <div className="rounded bg-slate-50 p-3">
            <div className="text-xs text-slate-500">العقار</div>
            <div className="font-semibold">{inv.property.title}</div>
          </div>
          <div className="rounded bg-slate-50 p-3">
            <div className="text-xs text-slate-500">المبلغ</div>
            <div className="font-semibold">{formatSAR(inv.amountSAR)}</div>
          </div>
        </div>
        <div className="flex gap-2 justify-center">
          <Link href="/dashboard" className="btn-primary">
            لوحة التحكم
          </Link>
          <Link href={`/properties/${params.id}`} className="btn-secondary">
            العقار
          </Link>
        </div>
      </div>
    </div>
  );
}
