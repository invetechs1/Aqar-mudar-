import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PropertyForm } from "@/components/PropertyForm";

export const metadata = { title: "إضافة عقار جديد" };

export default async function NewPropertyPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin?callbackUrl=/properties/new");

  return (
    <div className="mx-auto page-x" style={{ maxWidth: 940, padding: "40px 32px 80px" }}>
      <div className="mb-8">
        <div className="text-xs uppercase tracking-wider text-muted">عرض عقارك</div>
        <h1 className="font-extrabold mt-2" style={{ fontSize: 34, letterSpacing: "-0.01em" }}>
          إضافة عقار جديد
        </h1>
        <p className="mt-2 text-muted-2 font-light" style={{ fontSize: 15, lineHeight: 1.85 }}>
          بعد الإرسال يدخل العقار مرحلة المراجعة الهندسية من العراب للحصول على اعتماد Alarrab Certified.
        </p>
      </div>
      <PropertyForm />
    </div>
  );
}
