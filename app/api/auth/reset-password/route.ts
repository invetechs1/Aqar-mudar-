import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { consumeToken } from "@/lib/notify";
import { hashPassword, passwordSchema } from "@/lib/password";
import { audit } from "@/lib/audit";
import { rateLimit, clientKey } from "@/lib/rateLimit";

const schema = z.object({ token: z.string().min(10), password: passwordSchema });

export async function POST(req: NextRequest) {
  const rl = await rateLimit(clientKey(req, "reset-password"), 5, 900);
  if (!rl.allowed) return NextResponse.json({ error: "محاولات كثيرة" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "بيانات غير صحيحة", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const result = await consumeToken(parsed.data.token, "PASSWORD_RESET");
  if (!result?.userId) {
    return NextResponse.json({ error: "الرمز غير صالح أو منتهي" }, { status: 400 });
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await prisma.user.update({
    where: { id: result.userId },
    data: { passwordHash },
  });
  await audit({
    action: "user.password_reset",
    resource: "user",
    resourceId: result.userId,
    userId: result.userId,
    request: req,
  });
  return NextResponse.json({ ok: true });
}
