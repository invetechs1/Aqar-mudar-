import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyTotp } from "@/lib/totp";
import { audit } from "@/lib/audit";

const schema = z.object({ code: z.string().length(6) });

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "رمز غير صحيح" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.totpSecret) return NextResponse.json({ error: "لم يتم بدء الإعداد" }, { status: 400 });

  if (!verifyTotp(user.totpSecret, parsed.data.code)) {
    return NextResponse.json({ error: "الرمز غير صحيح" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { totpEnabled: true },
  });
  await audit({ action: "user.2fa_enabled", resource: "user", resourceId: user.id, userId: user.id, request: req });
  return NextResponse.json({ ok: true });
}
