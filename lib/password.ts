import bcrypt from "bcryptjs";
import { z } from "zod";

/**
 * Strong password policy:
 * - min 10 chars
 * - at least 1 lowercase, 1 uppercase, 1 digit, 1 symbol
 * - not one of the top 20 common weak passwords
 */
export const passwordSchema = z
  .string()
  .min(10, "كلمة المرور يجب ألا تقل عن 10 أحرف")
  .max(128, "كلمة المرور طويلة جدًا")
  .regex(/[a-z]/, "يجب أن تحتوي على حرف صغير")
  .regex(/[A-Z]/, "يجب أن تحتوي على حرف كبير")
  .regex(/\d/, "يجب أن تحتوي على رقم")
  .regex(/[^A-Za-z0-9]/, "يجب أن تحتوي على رمز خاص")
  .refine((v) => !WEAK.has(v.toLowerCase()), "كلمة المرور شائعة جدًا");

const WEAK = new Set([
  "password",
  "password1",
  "password123",
  "qwerty",
  "qwerty123",
  "12345678",
  "123456789",
  "1234567890",
  "letmein",
  "welcome",
  "admin",
  "administrator",
  "iloveyou",
  "monkey",
  "dragon",
  "sunshine",
  "princess",
  "abc123",
  "111111",
  "000000",
]);

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
