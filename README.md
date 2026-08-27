# عقار مدر — Aqar Mudar

منصة الاستثمار العقاري الموثوق والمعتمد هندسيًا للسوق السعودي.

**منتج من First Ex — Powered by Bassir Technology**

> "استثمر في عقار موثوق… قبل أن تستثمر في مجرد إعلان."

---

## آخر تحديث — إعادة تصميم شاملة + تغييرات قانونية

**تحديث تصميمي:** طُبّق التصميم المعتمد "Home Direction B" على كامل النظام:
- نظام ألوان جديد (green-900/700, gold-500/300, mint) + خط Cairo
- شعار جديد (roof arc + 3 columns) بأربع نسخ
- إعادة تصميم شاملة للـ Header/Footer، الرئيسية، القوائم، تفاصيل العقار، إضافة العقار، لوحة التحكم، التحقق، وصفحات الدخول

**تغييرات منتج قانونية:**
- 🚧 **البيع الجزئي مخفي خلف flag** `FEATURE_PARTIAL_SALE=false` (قيد ترخيص CMA/SPV). الكود والـ DB fields محفوظة، والـ CTA يظهر كـ "قريبًا"
- ⚠️ **تنبيه المخاطر** ظاهر على كل صفحة عقار مع تسمية "تقديري" لكل عائد
- 📜 **6 مستندات قانونية** (Terms, Privacy PDPL, Disclaimer, Risk, AML, Refund) بنظام سايدبار مشترك + banner "مسودة"
- 📝 **شاشة إقرار المستثمر** `/invest/[id]/acknowledge` بـ 8 checkboxes، كل واحد يُسجَّل كـ Consent مستقل مع IP + user-agent
- 🔒 **API الدفع محمي** بـ 412 Precondition Failed إذا لم يوجد إقرار كامل
- 📋 **موافقة signup** على 3 مستندات + **إقرار add-property** يُحفظان في جدول Consent

## نظرة سريعة على الجاهزية

| المحور | الحالة |
|--------|:------:|
| البنية التقنية (Postgres، Docker، Health، Logging) | ✅ |
| الأمان (Rate limit، CSP، CSRF، سياسة كلمات مرور، Audit Log) | ✅ |
| المصادقة (تحقق البريد، إعادة كلمة المرور، OTP جوال، TOTP 2FA) | ✅ |
| التحقق من الهوية (نفاذ — scaffold + mock mode) | ✅ |
| المدفوعات السعودية (Moyasar) + Stripe كبديل + Refunds | ✅ |
| تخزين الملفات (S3 adapter) + Sharp للتحسين | ✅ |
| البريد (Resend) + قوالب + SMS (Twilio) + In-app Notifications | ✅ |
| الوثائق القانونية (Terms، Privacy PDPL، AML، Refund، Disclaimer) | ✅ |
| اختبارات (Vitest unit + Playwright e2e) + CI/CD (GitHub Actions) | ✅ |
| SEO (Sitemap، Robots، JSON-LD، OpenGraph) + GA4 | ✅ |
| صفحات ثابتة (عن المنصة، تواصل، أسئلة شائعة، 404، 500) | ✅ |
| i18n كامل (عربي/إنجليزي مع تبديل RTL) | ✅ |
| **رخصة الوساطة العقارية / CMA** — يحتاج إجراء قانوني | 🚨 خارج نطاق الكود |
| **حساب تاجر Moyasar فعلي** — يحتاج تسجيل | 🚨 خارج نطاق الكود |
| **API keys لنفاذ فعلي** — يحتاج تسجيل | 🚨 خارج نطاق الكود |

## المكدس التقني

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** + دعم RTL كامل + خطوط Tajawal/Inter
- **PostgreSQL 16** عبر **Prisma** ORM
- **NextAuth.js** (Credentials + JWT + secure cookies + TOTP)
- **Zod** لكل مدخلات API
- **Sharp** لتحسين الصور (تحويل تلقائي إلى WebP)
- **AWS SDK v3** لتخزين S3-compatible (AWS/R2/MinIO)
- **Moyasar** بوابة دفع سعودية + **Stripe** كبديل
- **Resend** بريد + **Twilio** SMS + **Sentry** hooks
- **Playwright** + **Vitest** للاختبارات
- **Docker** + **docker-compose** للنشر

---

## التشغيل محليًا

### السريع (Docker Compose)

```bash
cp .env.example .env
# generate a strong secret
openssl rand -base64 32 | xargs -I {} sed -i 's|NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET="{}"|' .env

docker-compose up --build
```

يفتح على `http://localhost:3000`.

### التطوير المحلي

```bash
# 1) شغّل Postgres محليًا (أو استخدم docker-compose up db)
docker-compose up -d db

# 2) ثبّت الحزم
npm install

# 3) هيّئ .env
cp .env.example .env

# 4) قاعدة البيانات
npx prisma db push
npm run db:seed

# 5) تشغيل
npm run dev
```

### حسابات تجريبية (بعد seed)

| الدور | البريد | كلمة المرور |
|------|-------|-------------|
| Admin | admin@aqarmudar.sa | Password123! |
| Owner | owner@aqarmudar.sa | Password123! |
| Investor | investor@aqarmudar.sa | Password123! |
| Engineer | engineer@aqarmudar.sa | Password123! |

---

## بنية المشروع

```
app/
  layout.tsx                 # RTL/LTR ديناميكي + SEO + GA + JSON-LD
  page.tsx                   # الصفحة الرئيسية
  properties/                # قائمة + تفاصيل + إضافة + استثمار + callback
  auth/                      # signin, signup, verify-email, forgot/reset
  admin/                     # لوحة الأدمن + certify
  dashboard/                 # لوحة المستخدم + verify (2FA/OTP/Nafath)
  legal/                     # 6 مستندات قانونية بالعربية
  about, contact, faq        # صفحات ثابتة
  api/
    auth/                    # signup, verify-email, forgot/reset, phone, 2fa
    properties/              # CRUD
    admin/                   # certify, refund
    payments/                # moyasar (create + webhook) + stripe (create + webhook)
    upload/                  # image upload with Sharp
    nafath/                  # request + verify
    health/                  # DB + uptime check
    locale/                  # AR/EN cookie toggle
    inquiries/
components/
  Header, Footer, Providers
  PropertyCard, PropertyForm, PropertyMap, LocationPicker
  ImageUploader, InvestForm, InquiryForm
  CertifyForm, VerifyPanel
  LocaleSwitcher, Analytics, JsonLd
lib/
  prisma, auth, env, logger
  password, totp, rateLimit, audit
  email, sms, notify (+ tokens)
  storage (Sharp + local/S3)
  moyasar, stripe, nafath
  i18n, format
middleware.ts                # security headers + CSP
prisma/
  schema.prisma              # 9 models + 10 enums + indexes
  seed.ts
tests/
  unit/ (Vitest)             # password, totp, i18n
  e2e/ (Playwright)          # landing, locale, health
.github/workflows/
  ci.yml                     # lint + typecheck + unit + e2e + docker build
Dockerfile + docker-compose.yml
```

---

## الميزات الوظيفية

### إدارة العقارات
- CRUD كامل مع صور مُحسَّنة تلقائيًا (WebP، thumbnails)
- خرائط Leaflet + OSM (اختيار موقع + عرض)
- بادج `Alarrab Certified` بعد الاعتماد
- تصفية بالمدينة، النوع، نوع العرض، الاعتماد

### الاعتماد الهندسي
- 6 مؤشرات هندسية (الحالة الإنشائية، التشطيبات، الكهرباء، الميكانيكا، المخاطر، العمر)
- دراسة رفع القيمة (النسبة، النطاق، التكلفة، المدة، العائد)
- Admin form + transaction لقلب `isCertified=true`

### الاستثمار (بيع جزئي)
- **Moyasar** (مدى، Apple Pay، STC Pay، بطاقات) — الافتراضي للسعودية
- **Stripe** كبديل للبطاقات الدولية
- Webhook مع تحقق التوقيع + Investment status transitions
- صفحة callback + إيصال بريد
- استرداد من لوحة الأدمن

### المصادقة والأمان
- كلمات مرور قوية (10+، upper/lower/digit/symbol، blocklist)
- تفعيل البريد + إعادة تعيين + OTP جوال
- TOTP 2FA (RFC 6238، بدون تبعية خارجية)
- Rate limiting على كل نقاط الحساسية
- CSP، HSTS، nosniff، Frame-DENY
- Audit Log مع IP + user-agent

### الامتثال والقانوني
- 6 وثائق قانونية عربية (Terms، Privacy PDPL، Cookies، AML، Refund، Disclaimer)
- التحقق عبر نفاذ (scaffold + mock mode للتطوير)
- سجلات KYC + حفظ 10 سنوات (متطلب نظامي)

### التسويق والـ SEO
- OpenGraph + Twitter cards
- JSON-LD (Organization + RealEstateListing + FAQPage)
- sitemap.xml ديناميكي
- robots.txt
- GA4 اختياري
- OG images أوتوماتيك

---

## المتطلبات الخارجية (خارج نطاق الكود)

قبل الإطلاق التجاري الفعلي، يجب إنجاز الأمور التالية بشكل منفصل:

### قانوني / تنظيمي (الأهم)
- [ ] استشارة محامٍ سعودي مختص في العقار/الفنتك
- [ ] رخصة **الوساطة العقارية** من الهيئة العامة للعقار
- [ ] تحديد المسار التنظيمي للبيع الجزئي: **CMA** أو **SPV** أو **صندوق عقاري**
- [ ] اتفاقيات موثّقة مع Alarrab و Azoom
- [ ] تسجيل نظام حماية البيانات لدى **SDAIA**
- [ ] الفوترة الإلكترونية عبر **ZATCA (فاتورة)**
- [ ] سياسة AML/KYC معتمدة والانضمام إلى **SAFIU**

### تشغيلي
- [ ] حساب تاجر **Moyasar** فعّال (يتطلب سجل تجاري)
- [ ] تسجيل رسمي في برنامج **نفاذ** والحصول على API keys
- [ ] حساب **Resend** بنطاق موثّق (SPF/DKIM/DMARC)
- [ ] حساب **Twilio** (أو مزود SMS محلي — Unifonic / Cequens)
- [ ] استضافة إنتاجية (Vercel / AWS / STC Cloud)
- [ ] قاعدة بيانات Postgres مُدارة مع Backups يومية
- [ ] S3 bucket (AWS me-south-1 / Cloudflare R2 / MinIO)
- [ ] نطاق `aqarmudar.sa` + شهادة SSL
- [ ] Sentry account
- [ ] Google Analytics / Search Console

### أمني
- [ ] مراجعة أمنية معتمدة (Penetration Test) من شركة سعودية مرخّصة
- [ ] استعراض الكود (Code Audit)
- [ ] خطة الاستجابة للحوادث (Incident Response Plan)

---

## Environment Variables

راجع `.env.example` — كل متغير موثّق. المتغيرات الحرجة للإنتاج:

```
NODE_ENV=production
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://aqarmudar.sa
NEXTAUTH_SECRET=<openssl rand -base64 32>
STORAGE_DRIVER=s3
S3_BUCKET=aqarmudar-uploads
EMAIL_DRIVER=resend
RESEND_API_KEY=re_...
SMS_DRIVER=twilio
MOYASAR_SECRET_KEY=sk_live_...
MOYASAR_WEBHOOK_SECRET=whsec_...
NAFATH_API_URL=https://...
NAFATH_CLIENT_ID=...
NAFATH_CLIENT_SECRET=...
SENTRY_DSN=https://...
NEXT_PUBLIC_GA_ID=G-...
```

---

## الاختبارات

```bash
npm run typecheck        # فحص TypeScript
npm test                 # Vitest unit tests
npm run test:e2e:install # تثبيت Playwright browsers
npm run test:e2e         # E2E tests
```

CI يشغّل كل ما سبق + بناء Docker على كل push/PR.

---

## المدفوعات

**Moyasar (مُوصى به للسعودية):**
- سجّل حسابك على [moyasar.com](https://moyasar.com)
- أضف `MOYASAR_SECRET_KEY` و `MOYASAR_PUBLISHABLE_KEY` و `MOYASAR_WEBHOOK_SECRET`
- Webhook: `POST /api/payments/moyasar/webhook` — أضف `x-moyasar-webhook-secret` header
- يدعم Mada، Apple Pay، STC Pay، Visa/Mastercard

**Stripe (احتياطي دولي):**
- Webhook: `POST /api/payments/webhook` — يتحقق من التوقيع

---

## الشراكة

- **Alarrab Engineering & Partner** — الاعتماد الهندسي
- **Azoom United Contracting** — دراسات التطوير والترميم
- **First Ex** — المنتج
- **Bassir Technology** — التقنية
