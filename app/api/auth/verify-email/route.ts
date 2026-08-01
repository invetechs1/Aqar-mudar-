import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { consumeToken } from "@/lib/notify";
import { audit } from "@/lib/audit";
import { rateLimit, clientKey } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const rl = await rateLimit(clientKey(req, "verify-email"), 10, 300);
  if (!rl.allowed) return NextResponse.json({ error: "محاولات كثيرة" }, { status: 429 });

  const { token } = await req.json().catch(() => ({}));
  if (!token) return NextResponse.json({ error: "رمز مفقود" }, { status: 400 });

  const result = await consumeToken(String(token), "EMAIL_VERIFY");
  if (!result?.userId) {
    return NextResponse.json({ error: "الرمز غير صالح أو منتهي" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: result.userId },
    data: { emailVerified: new Date() },
  });
  await audit({ action: "user.email_verified", resource: "user", resourceId: result.userId, userId: result.userId, request: req });
  return NextResponse.json({ ok: true });
}
