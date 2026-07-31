import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PropertyForm } from "@/components/PropertyForm";

export default async function NewPropertyPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin?callbackUrl=/properties/new");

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">إضافة عقار جديد</h1>
      <p className="text-slate-600 mb-8">
        بعد إنشاء العقار، سيدخل قيد المراجعة الهندسية من العراب للحصول على الاعتماد.
      </p>
      <PropertyForm />
    </div>
  );
}
