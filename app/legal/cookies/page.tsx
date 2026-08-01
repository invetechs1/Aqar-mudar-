export const metadata = { title: "سياسة الكوكيز — عقار مدر" };

export default function CookiesPage() {
  return (
    <>
      <h1>سياسة الكوكيز</h1>

      <h2>ما هي الكوكيز؟</h2>
      <p>ملفات نصية صغيرة تُخزَّن في متصفحك لتحسين تجربتك على المنصة.</p>

      <h2>الأنواع التي نستخدمها</h2>
      <table>
        <thead>
          <tr><th>الاسم</th><th>الغرض</th><th>المدة</th></tr>
        </thead>
        <tbody>
          <tr><td>next-auth.session-token</td><td>جلسة الدخول</td><td>7 أيام</td></tr>
          <tr><td>next-auth.csrf-token</td><td>حماية CSRF</td><td>الجلسة</td></tr>
          <tr><td>locale</td><td>لغة الواجهة (عربي/إنجليزي)</td><td>سنة</td></tr>
          <tr><td>_ga, _ga_*</td><td>تحليلات Google Analytics (اختياري)</td><td>سنتان</td></tr>
        </tbody>
      </table>

      <h2>خياراتك</h2>
      <p>
        يمكنك تعطيل الكوكيز من إعدادات المتصفح، لكن ذلك قد يُعطّل بعض وظائف المنصة
        (مثل تسجيل الدخول). لتعطيل التحليلات فقط، استخدم إضافة{" "}
        <a href="https://tools.google.com/dlpage/gaoptout" rel="noopener">
          Google Analytics Opt-out
        </a>.
      </p>
    </>
  );
}
