import { cookies } from "next/headers";

export type Locale = "ar" | "en";

export const LOCALE_COOKIE = "locale";
export const DEFAULT_LOCALE: Locale = "ar";

const dictionaries = {
  ar: {
    dir: "rtl",
    langLabel: "العربية",
    nav: {
      home: "الرئيسية",
      properties: "العقارات",
      certified: "اعتماد العراب",
      about: "عن المنصة",
      dashboard: "لوحة التحكم",
      admin: "الأدمن",
      signin: "تسجيل الدخول",
      signup: "إنشاء حساب",
      signout: "خروج",
    },
    hero: {
      badge: "معتمد هندسيًا من العراب",
      titleA: "استثمر في عقار موثوق…",
      titleB: "قبل أن تستثمر في مجرد إعلان.",
      subtitle:
        "عقار مدر هي منصة عقارية ذكية تربط ملاك العقارات والمستثمرين بتقارير هندسية موثوقة وفرص تطوير حقيقية — لاستثمار عقاري شفاف وآمن.",
      ctaBrowse: "تصفح العقارات المعتمدة",
      ctaOwner: "سجّل كمالك عقار",
      stats: {
        inspected: "عقارات مفحوصة",
        indicators: "مؤشر هندسي",
        bilingual: "دعم كامل",
      },
      caption: "اعتماد هندسي احترافي لكل عقار",
    },
    features: {
      title: "لماذا عقار مدر؟",
      subtitle:
        "نحن لا نعرض أي عقار قبل حصوله على اعتماد هندسي شامل. الشفافية والموثوقية أولويتنا.",
      items: [
        {
          t: "اعتماد هندسي موثوق",
          d: "تقرير فني احترافي يشمل الحالة الإنشائية، جودة التشطيبات، الأنظمة الكهربائية والميكانيكية، ومستوى المخاطر.",
          i: "🏗️",
        },
        {
          t: "رفع القيمة العقارية",
          d: "دراسات تطوير وترميم من Azoom United Contracting مع تكلفة تقديرية وعائد متوقع بعد التطوير.",
          i: "📈",
        },
        {
          t: "شفافية للمستثمر",
          d: "لوحة تحكم ذكية، تقارير حقيقية، مقارنة الفرص، وإدارة الوثائق — كل ما تحتاجه لقرار مبني على بيانات.",
          i: "🛡️",
        },
      ],
    },
    audiences: {
      title: "لمن تُقدَّم المنصة؟",
      groups: [
        {
          t: "ملاك العقارات",
          items: [
            "عرض العقار بطريقة احترافية",
            "رفع موثوقية العقار عبر الاعتماد الهندسي",
            "الوصول لمستثمرين جادين",
          ],
        },
        {
          t: "المستثمرون",
          items: [
            "الوصول لعقارات موثوقة ومعتمدة",
            "الاطلاع على تقارير هندسية حقيقية",
            "معرفة المخاطر قبل الاستثمار",
          ],
        },
        {
          t: "المطورون العقاريون",
          items: [
            "اكتشاف فرص تطوير جاهزة",
            "دراسة العائد المتوقع قبل الشراء",
            "تنفيذ الترميمات عبر جهات معتمدة",
          ],
        },
      ],
    },
    featured: {
      title: "عقارات معتمدة",
      subtitle: "فرص استثمارية موثوقة، مفحوصة هندسيًا وجاهزة للاستثمار.",
      viewAll: "عرض الكل",
    },
    cta: {
      title: "اعرض عقارك الآن",
      subtitle:
        "انضم إلى قائمة الملاك الذين رفعوا موثوقية عقاراتهم بالاعتماد الهندسي من العراب.",
      button: "ابدأ الآن مجانًا →",
    },
    footer: {
      tag: "منصة الاستثمار العقاري المعتمدة هندسيًا. استثمر في عقار موثوق قبل أن تستثمر في مجرد إعلان.",
      platform: "المنصة",
      partners: "الشركاء",
      contact: "تواصل",
      links: ["العقارات المتاحة", "اعتماد العراب", "خدمات التطوير"],
      copyright:
        "عقار مدر — منتج من First Ex — Powered by Bassir Technology",
    },
  },
  en: {
    dir: "ltr",
    langLabel: "English",
    nav: {
      home: "Home",
      properties: "Properties",
      certified: "Alarrab Certified",
      about: "About",
      dashboard: "Dashboard",
      admin: "Admin",
      signin: "Sign in",
      signup: "Sign up",
      signout: "Sign out",
    },
    hero: {
      badge: "Engineering-Certified by Alarrab",
      titleA: "Invest in a trusted property…",
      titleB: "not just an ad.",
      subtitle:
        "Aqar Mudar is a smart real-estate platform connecting owners and investors through verified engineering reports and real development opportunities — for transparent, safe real-estate investing.",
      ctaBrowse: "Browse certified properties",
      ctaOwner: "Register as owner",
      stats: {
        inspected: "Inspected properties",
        indicators: "Engineering indicators",
        bilingual: "Full support",
      },
      caption: "Professional engineering certification for every property",
    },
    features: {
      title: "Why Aqar Mudar?",
      subtitle:
        "We do not list any property before it receives a full engineering certification. Transparency and trust are our priority.",
      items: [
        {
          t: "Trusted engineering certification",
          d: "A professional report covering structural condition, finishing quality, electrical and mechanical systems, and risk level.",
          i: "🏗️",
        },
        {
          t: "Value uplift",
          d: "Renovation studies by Azoom United Contracting with estimated cost and expected return after development.",
          i: "📈",
        },
        {
          t: "Investor transparency",
          d: "Smart dashboard, real reports, opportunity comparison, and document management — everything needed for a data-driven decision.",
          i: "🛡️",
        },
      ],
    },
    audiences: {
      title: "Who is this for?",
      groups: [
        {
          t: "Property owners",
          items: [
            "Present properties professionally",
            "Boost trust through engineering certification",
            "Reach serious investors",
          ],
        },
        {
          t: "Investors",
          items: [
            "Access trusted, certified properties",
            "Review real engineering reports",
            "Understand risks before investing",
          ],
        },
        {
          t: "Developers",
          items: [
            "Discover ready development opportunities",
            "Study expected returns before purchase",
            "Execute renovations through certified partners",
          ],
        },
      ],
    },
    featured: {
      title: "Certified properties",
      subtitle: "Trusted investment opportunities, engineering-inspected and ready.",
      viewAll: "View all",
    },
    cta: {
      title: "List your property now",
      subtitle:
        "Join owners who boosted the credibility of their properties with Alarrab's engineering certification.",
      button: "Get started free →",
    },
    footer: {
      tag: "The engineering-certified real-estate investment platform. Invest in a trusted property, not just an ad.",
      platform: "Platform",
      partners: "Partners",
      contact: "Contact",
      links: ["Available properties", "Alarrab Certified", "Development services"],
      copyright:
        "Aqar Mudar — a First Ex product — Powered by Bassir Technology",
    },
  },
} as const;

export type Dictionary = typeof dictionaries.ar;

export function getLocale(): Locale {
  const cookie = cookies().get(LOCALE_COOKIE)?.value;
  return cookie === "en" ? "en" : "ar";
}

export function getDictionary(locale?: Locale): Dictionary {
  const l = locale ?? getLocale();
  return dictionaries[l] as Dictionary;
}

export function isRTL(locale?: Locale): boolean {
  return (locale ?? getLocale()) === "ar";
}
