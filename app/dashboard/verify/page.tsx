import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VerifyPanel } from "@/components/VerifyPanel";
import { isNafathConfigured } from "@/lib/nafath";

export const dynamic = "force-dynamic";

export default async function VerifyPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin?callbackUrl=/dashboard/verify");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      phone: true,
      emailVerified: true,
      phoneVerified: true,
      nafathVerified: true,
      totpEnabled: true,
    },
  });
  if (!user) redirect("/dashboard");

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">التحقق من الحساب</h1>
      <p className="text-slate-600 mb-8">
        كلما اكتمل تحققك، ازدادت الصلاحيات المتاحة (خاصةً للاستثمار).
      </p>
      <VerifyPanel
        email={user.email}
        phone={user.phone}
        emailVerified={!!user.emailVerified}
        phoneVerified={!!user.phoneVerified}
        nafathVerified={!!user.nafathVerified}
        totpEnabled={user.totpEnabled}
        nafathReady={isNafathConfigured()}
      />
    </div>
  );
}
