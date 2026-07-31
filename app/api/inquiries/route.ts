import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

const schema = z.object({
  propertyId: z.string().min(1),
  message: z.string().min(5).max(1000),
  contact: z.string().min(5).max(120),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "بيانات غير صحيحة", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const property = await prisma.property.findUnique({ where: { id: parsed.data.propertyId } });
  if (!property) return NextResponse.json({ error: "العقار غير موجود" }, { status: 404 });

  const inquiry = await prisma.inquiry.create({
    data: {
      ...parsed.data,
      fromUserId: session?.user?.id ?? null,
    },
  });

  return NextResponse.json({ inquiry }, { status: 201 });
}
