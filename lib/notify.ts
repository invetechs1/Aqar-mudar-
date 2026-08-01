import { randomBytes, randomInt } from "crypto";
import { prisma } from "./prisma";
import { env } from "./env";
import { sendEmail, templates } from "./email";
import { sendSMS } from "./sms";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

// ---- Verification tokens ----

async function createToken(
  type: "EMAIL_VERIFY" | "PASSWORD_RESET" | "PHONE_OTP",
  userId: string | null,
  ttlMs: number,
  identifier?: string | null,
  tokenValue?: string
): Promise<string> {
  const token = tokenValue ?? randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: {
      token,
      type,
      userId: userId ?? undefined,
      identifier: identifier ?? undefined,
      expiresAt: new Date(Date.now() + ttlMs),
    },
  });
  return token;
}

export async function sendEmailVerification(userId: string, email: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;
  const token = await createToken("EMAIL_VERIFY", userId, DAY);
  const url = `${env.NEXTAUTH_URL}/auth/verify-email?token=${token}`;
  const msg = templates.verifyEmail(user.name, url);
  await sendEmail({ to: email, ...msg });
}

export async function sendPasswordReset(email: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return;
  const token = await createToken("PASSWORD_RESET", user.id, HOUR);
  const url = `${env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;
  const msg = templates.resetPassword(user.name, url);
  await sendEmail({ to: user.email, ...msg });
}

export async function sendPhoneOTP(userId: string, phone: string): Promise<string> {
  const code = String(randomInt(100000, 1000000));
  await createToken("PHONE_OTP", userId, 10 * 60 * 1000, phone, code);
  await sendSMS(phone, `رمز التحقق في عقار مدر: ${code}\nصلاحيته 10 دقائق.`);
  return code;
}

export async function consumeToken(
  token: string,
  type: "EMAIL_VERIFY" | "PASSWORD_RESET" | "PHONE_OTP"
): Promise<{ userId: string | null; identifier: string | null } | null> {
  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record) return null;
  if (record.type !== type) return null;
  if (record.usedAt) return null;
  if (record.expiresAt < new Date()) return null;
  await prisma.verificationToken.update({
    where: { token },
    data: { usedAt: new Date() },
  });
  return { userId: record.userId ?? null, identifier: record.identifier ?? null };
}

// ---- In-app notifications ----

export async function notify(
  userId: string,
  kind: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<void> {
  await prisma.notification.create({
    data: { userId, kind, title, body, data: data as any },
  });
}
