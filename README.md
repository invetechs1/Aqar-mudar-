# عقار مدر — Aqar Mudar

منصة الاستثمار العقاري الموثوق والمعتمد هندسيًا.

**منتج من First Ex — Powered by Bassir Technology**

> "استثمر في عقار موثوق… قبل أن تستثمر في مجرد إعلان."

---

## نبذة

عقار مدر منصة عقارية سعودية تربط ملاك العقارات والمستثمرين مع الاستشاري الهندسي والمقاول ضمن منظومة رقمية متكاملة. أي عقار على المنصة لا يُنشر قبل حصوله على **اعتماد العراب (Alarrab Certified)** — تقرير فني شامل من Alarrab Engineering & Partner يوضح الحالة الإنشائية، جودة التشطيبات، الأنظمة الكهربائية والميكانيكية، مستوى المخاطر، والعمر الافتراضي التقديري، بالإضافة إلى فرص رفع القيمة السوقية عبر دراسات التطوير من Azoom United Contracting.

---

## المكدس التقني

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** مع دعم RTL كامل وخط Tajawal العربي
- **Prisma** ORM
- **SQLite** افتراضيًا للـ MVP (قابل للتبديل إلى Postgres بتغيير سطر واحد)
- **NextAuth.js** (Credentials Provider) مع bcrypt
- **Zod** للتحقق من صحة المدخلات

## المزايا في هذا الـ MVP

- تسجيل / دخول متعدد الأدوار (مالك، مستثمر، أدمن)
- إنشاء وعرض العقارات مع **رفع صور فعلي** إلى `public/uploads/`
- بطاقة العقار مع بادج "العراب Certified"
- صفحة تفاصيل العقار مع التقرير الهندسي الكامل ودراسة رفع القيمة
- **خرائط تفاعلية** بـ Leaflet + OpenStreetMap (اختيار الموقع + عرض)
- نظام استفسارات مباشر على العقار
- لوحة تحكم للمالك (إحصاءات، عقاراته، استفساراته)
- **لوحة أدمن** لاعتماد التقارير الهندسية ونشر العقارات
- تصفية العقارات (المدينة، النوع، الاعتماد)
- **دعم لغتين (عربي/إنجليزي)** مع تبديل RTL/LTR حسب اللغة
- **بوابة دفع Stripe** للبيع الجزئي (شراء حصص + Webhook)

---

## التشغيل محليًا

### المتطلبات

- Node.js 18.17+ (يُفضّل 20+)
- npm أو pnpm

### الخطوات

```bash
# 1) تثبيت الحزم
npm install

# 2) تجهيز ملف البيئة
cp .env.example .env

# 3) إنشاء قاعدة البيانات وتشغيل الميغرشن
npx prisma db push

# 4) تعبئة بيانات تجريبية (3 عقارات + 3 حسابات)
npm run db:seed

# 5) تشغيل الخادم
npm run dev
```

افتح المتصفح على `http://localhost:3000`

### حسابات تجريبية

| الدور | البريد | كلمة المرور |
|------|-------|-------------|
| أدمن | admin@aqarmudar.sa | password123 |
| مالك | owner@aqarmudar.sa | password123 |
| مستثمر | investor@aqarmudar.sa | password123 |

---

## بنية المشروع

```
app/
  layout.tsx              # RTL layout + الرأس والتذييل
  page.tsx                # الصفحة الرئيسية (Hero + الفئات + عقارات مميزة)
  properties/
    page.tsx              # قائمة العقارات مع الفلاتر
    [id]/page.tsx         # صفحة تفاصيل العقار مع التقرير الهندسي
    new/page.tsx          # إضافة عقار (يتطلب تسجيل دخول)
  auth/
    signin/page.tsx       # تسجيل الدخول
    signup/page.tsx       # إنشاء حساب
  dashboard/page.tsx      # لوحة تحكم المالك
  api/
    auth/[...nextauth]/   # NextAuth
    auth/signup/          # POST تسجيل
    properties/           # GET + POST
    properties/[id]/      # GET + DELETE
    inquiries/            # POST
components/
  Header.tsx, Footer.tsx, Providers.tsx
  PropertyCard.tsx, PropertyForm.tsx, InquiryForm.tsx
lib/
  prisma.ts               # عميل Prisma singleton
  auth.ts                 # إعدادات NextAuth
  format.ts               # دوال تنسيق + قواميس عربية
prisma/
  schema.prisma           # مخطط قاعدة البيانات
  seed.ts                 # بيانات تجريبية
```

---

## نموذج البيانات

- **User** — id, email, passwordHash, name, phone, role (OWNER | INVESTOR | ADMIN)
- **Property** — تفاصيل العقار كاملة + status (PENDING_REVIEW | CERTIFIED | REJECTED | SOLD)
- **EngineeringReport** — التقرير الهندسي المرتبط بالعقار (علاقة 1:1)
- **Inquiry** — استفسارات على العقارات (مسجل أو زائر)

---

## التبديل إلى Postgres

في `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // بدلًا من sqlite
  url      = env("DATABASE_URL")
}
```

ثم في `.env`:

```
DATABASE_URL="postgresql://user:pass@host:5432/aqarmudar"
```

```bash
npx prisma db push
npm run db:seed
```

---

## خارطة الطريق التالية

- [x] رفع الصور محليًا (استبدال بـ S3/Cloudinary للإنتاج)
- [x] دعم اللغة الإنجليزية مع تبديل RTL
- [x] خرائط تفاعلية (Leaflet + OSM)
- [x] لوحة الأدمن لاعتماد التقارير الهندسية
- [x] بوابة دفع Stripe للبيع الجزئي
- [ ] استبدال التخزين المحلي للصور بـ S3/Cloudinary للإنتاج
- [ ] Stripe Elements في الواجهة لإكمال الدفع بصريًا
- [ ] Audit Log وصلاحيات متقدمة
- [ ] ربط مع ERP وأنظمة إدارة المشاريع
- [ ] تطبيق جوال (React Native / Flutter)

## بوابة الدفع (Stripe)

بوابة الدفع اختيارية. لتفعيلها:

1. أنشئ حسابًا على [stripe.com](https://stripe.com) واحصل على مفاتيح الاختبار.
2. أضف إلى `.env`:
   ```
   STRIPE_SECRET_KEY="sk_test_..."
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   ```
3. Webhook endpoint: `POST /api/payments/webhook` (استقبل `payment_intent.succeeded`).

عند الضغط على "استثمر" في عقار للبيع الجزئي، يتم إنشاء `Investment` بحالة `PENDING`
و`PaymentIntent` عبر Stripe. عند نجاح الدفع (webhook) تُحدَّث الحالة إلى `PAID` وتُخصم
الحصص من العقار تلقائيًا.

## الخرائط

استخدمنا Leaflet مع OpenStreetMap بدون مفاتيح API. الـ CSS يُحمَّل من CDN عند الحاجة
فقط (dynamic import). في صفحة إضافة العقار، الخريطة تعمل كـ picker (اضغط على الخريطة
لتحديد الموقع)، وفي صفحة التفاصيل تعرض marker.

## اللغات

نستخدم نظام dictionary بسيط في `lib/i18n.ts` مع cookie اسمه `locale`. زر التبديل في
الرأس (`LocaleSwitcher`) يُغيّر الكوكي عبر `POST /api/locale` ثم يعمل refresh — الـ
layout يقرأ الكوكي server-side ويضبط `dir` و `lang` على `<html>` تلقائيًا.

---

## الشركاء

- **Alarrab Engineering & Partner** — الاعتماد الهندسي
- **Azoom United Contracting** — دراسات التطوير والترميم
- **First Ex** — المنتج
- **Bassir Technology** — التقنية
