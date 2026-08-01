import { env } from "./env";
import { logger } from "./logger";

type Message = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

async function sendConsole(msg: Message): Promise<void> {
  logger.info("email_stub", { to: msg.to, subject: msg.subject });
  console.log("\n────── EMAIL ──────");
  console.log("To:      ", msg.to);
  console.log("Subject: ", msg.subject);
  console.log("Text:    ", msg.text ?? "(html only)");
  console.log("───────────────────\n");
}

async function sendResend(msg: Message): Promise<void> {
  if (!env.RESEND_API_KEY) throw new Error("RESEND_API_KEY not set");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: [msg.to],
      subject: msg.subject,
      html: msg.html,
      text: msg.text,
    }),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Resend send failed: ${res.status} ${err}`);
  }
}

export async function sendEmail(msg: Message): Promise<void> {
  if (env.EMAIL_DRIVER === "resend") {
    return sendResend(msg);
  }
  return sendConsole(msg);
}

// ---------------- Templates ----------------

export function emailShell(title: string, bodyHtml: string): string {
  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>${escape(title)}</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Tajawal,-apple-system,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 16px">
<tr><td align="center">
  <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.06)">
    <tr><td style="background:#265444;padding:24px;color:#fff;text-align:center">
      <div style="font-size:20px;font-weight:900">عقار مدر — Aqar Mudar</div>
      <div style="font-size:12px;opacity:.8">منصة الاستثمار العقاري المعتمدة هندسيًا</div>
    </td></tr>
    <tr><td style="padding:32px 28px;color:#0f172a;font-size:15px;line-height:1.7">${bodyHtml}</td></tr>
    <tr><td style="padding:20px;text-align:center;font-size:12px;color:#64748b;border-top:1px solid #e2e8f0">
      © ${new Date().getFullYear()} Aqar Mudar. جميع الحقوق محفوظة.
    </td></tr>
  </table>
</td></tr>
</table>
</body></html>`;
}

function escape(s: string): string {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );
}

export const templates = {
  verifyEmail(name: string, url: string): { subject: string; html: string; text: string } {
    return {
      subject: "تأكيد بريدك الإلكتروني — عقار مدر",
      html: emailShell(
        "تأكيد البريد",
        `<p>مرحبًا ${escape(name)}،</p>
         <p>لتفعيل حسابك في منصة عقار مدر، الرجاء تأكيد بريدك الإلكتروني بالضغط على الزر التالي:</p>
         <p style="text-align:center;margin:32px 0">
           <a href="${escape(url)}" style="display:inline-block;background:#265444;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:700">تأكيد البريد</a>
         </p>
         <p style="color:#64748b;font-size:13px">صلاحية هذا الرابط 24 ساعة. إذا لم تقم بإنشاء حساب، تجاهل هذه الرسالة.</p>`
      ),
      text: `مرحبًا ${name}، لتأكيد بريدك في عقار مدر افتح الرابط: ${url}`,
    };
  },
  resetPassword(name: string, url: string): { subject: string; html: string; text: string } {
    return {
      subject: "إعادة تعيين كلمة المرور — عقار مدر",
      html: emailShell(
        "إعادة تعيين كلمة المرور",
        `<p>مرحبًا ${escape(name)}،</p>
         <p>تلقّينا طلبًا لإعادة تعيين كلمة المرور لحسابك. اضغط الزر أدناه لإنشاء كلمة مرور جديدة:</p>
         <p style="text-align:center;margin:32px 0">
           <a href="${escape(url)}" style="display:inline-block;background:#265444;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:700">إعادة تعيين كلمة المرور</a>
         </p>
         <p style="color:#64748b;font-size:13px">صلاحية هذا الرابط ساعة واحدة. إذا لم تطلب ذلك، تجاهل هذه الرسالة.</p>`
      ),
      text: `افتح الرابط لإعادة تعيين كلمة المرور: ${url}`,
    };
  },
  investmentReceipt(name: string, opts: {
    propertyTitle: string;
    shares: number;
    amountSAR: number;
    reference: string;
  }): { subject: string; html: string; text: string } {
    const amount = new Intl.NumberFormat("ar-SA", { style: "currency", currency: "SAR", maximumFractionDigits: 0 }).format(opts.amountSAR);
    return {
      subject: `إيصال استثمار — ${opts.propertyTitle}`,
      html: emailShell(
        "شكرًا لاستثمارك",
        `<p>مرحبًا ${escape(name)}،</p>
         <p>تم استلام دفعتك بنجاح. تفاصيل الاستثمار:</p>
         <table cellpadding="8" style="width:100%;background:#f8fafc;border-radius:8px;font-size:14px">
           <tr><td>العقار</td><td style="text-align:left;font-weight:700">${escape(opts.propertyTitle)}</td></tr>
           <tr><td>عدد الحصص</td><td style="text-align:left;font-weight:700">${opts.shares}</td></tr>
           <tr><td>المبلغ</td><td style="text-align:left;font-weight:700">${escape(amount)}</td></tr>
           <tr><td>رقم المرجع</td><td style="text-align:left;font-family:monospace">${escape(opts.reference)}</td></tr>
         </table>
         <p style="color:#64748b;font-size:13px;margin-top:20px">احتفظ بهذا الإيصال كمرجع. للاستفسار: info@aqarmudar.sa</p>`
      ),
      text: `تم استلام دفعتك: ${opts.propertyTitle} — ${opts.shares} حصة — ${amount}`,
    };
  },
  inquiryNotice(ownerName: string, opts: {
    propertyTitle: string;
    contact: string;
    message: string;
    url: string;
  }): { subject: string; html: string; text: string } {
    return {
      subject: `استفسار جديد على عقارك — ${opts.propertyTitle}`,
      html: emailShell(
        "استفسار جديد",
        `<p>مرحبًا ${escape(ownerName)}،</p>
         <p>تلقيت استفسارًا جديدًا على عقارك: <strong>${escape(opts.propertyTitle)}</strong></p>
         <table cellpadding="8" style="width:100%;background:#f8fafc;border-radius:8px;font-size:14px">
           <tr><td>معلومات التواصل</td><td style="text-align:left">${escape(opts.contact)}</td></tr>
           <tr><td colspan="2"><em>الرسالة:</em><br>${escape(opts.message)}</td></tr>
         </table>
         <p style="text-align:center;margin:24px 0">
           <a href="${escape(opts.url)}" style="display:inline-block;background:#265444;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-weight:700">عرض في لوحة التحكم</a>
         </p>`
      ),
      text: `استفسار جديد على "${opts.propertyTitle}" من ${opts.contact}: ${opts.message}`,
    };
  },
};
