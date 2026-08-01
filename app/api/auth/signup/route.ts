import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, passwordSchema } from "@/lib/password";
import { rateLimit, clientKey } from "@/lib/rateLimit";
import { audit } from "@/lib/audit";
import { sendEmailVerification } from "@/lib/notify";

const schema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(200),
  password: passwordSchema,
  phone: z
    .string()
    .regex(/^\+?[0-9\s-]{8,20}$/, "رقم جوال غير صحيح")
    .optional(),
  role: z.enum(["OWNER", "INVESTOR"]).default("OWNER"),
});

export async function POST(req: NextRequest) {
  const rl = await rateLimit(clientKey(req, "signup"), 5, 300);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "محاولات كثيرة. حاول مجددًا بعد قليل." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "بيانات غير صحيحة", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { name, email, password, phone, role } = parsed.data;
  const emailLower = email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: emailLower } });
  if (existing) {
    return NextResponse.json({ error: "البريد الإلكتروني مستخدم بالفعل" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email: emailLower, passwordHash, phone, role },
    select: { id: true, email: true, name: true, role: true },
  });

  await audit({
    action: "user.signup",
    resource: "user",
    resourceId: user.id,
    userId: user.id,
    request: req,
  });

  await sendEmailVerification(user.id, emailLower).catch(() => {});

  return NextResponse.json({ user }, { status: 201 });
}
