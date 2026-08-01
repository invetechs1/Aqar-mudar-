import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <div className="text-7xl font-black text-brand-700 mb-2">404</div>
      <h1 className="text-2xl font-bold mb-3">الصفحة غير موجودة</h1>
      <p className="text-slate-600 mb-6">
        الصفحة التي تبحث عنها قد تكون قد نُقلت أو حُذفت.
      </p>
      <div className="flex gap-2 justify-center">
        <Link href="/" className="btn-primary">
          الرئيسية
        </Link>
        <Link href="/properties" className="btn-secondary">
          العقارات
        </Link>
      </div>
    </div>
  );
}
