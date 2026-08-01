import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { requestVerification } from "@/lib/nafath";
import { rateLimit, clientKey } from "@/lib/rateLimit";

const schema = z.object({ nationalId: z.string().regex(/^\d{10}$/, "رقم هوية غير صحيح") });

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const rl = await rateLimit(clientKey(req, `nafath:${session.user.id}`), 5, 600);
  if (!rl.allowed) return NextResponse.json({ error: "محاولات كثيرة" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });

  try {
    const request = await requestVerification(parsed.data.nationalId);
    return NextResponse.json(request);
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "فشل الطلب" }, { status: 500 });
  }
}
