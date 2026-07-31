import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

const createSchema = z.object({
  title: z.string().min(4).max(120),
  description: z.string().min(20).max(2000),
  city: z.string().min(2).max(60),
  district: z.string().max(80).optional(),
  address: z.string().max(200).optional(),
  propertyType: z.enum(["APARTMENT", "VILLA", "LAND", "COMMERCIAL", "BUILDING"]),
  listingType: z.enum(["SALE", "PARTIAL_SALE", "INVESTMENT"]),
  price: z.number().positive(),
  area: z.number().positive(),
  bedrooms: z.number().int().nonnegative().optional(),
  bathrooms: z.number().int().nonnegative().optional(),
  yearBuilt: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  totalShares: z.number().int().positive().optional(),
  sharePriceSAR: z.number().positive().optional(),
  images: z.array(z.string().min(1)).max(10).default([]),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city") ?? undefined;
  const type = searchParams.get("type") ?? undefined;
  const listing = searchParams.get("listing") ?? undefined;
  const certifiedOnly = searchParams.get("certified") === "1";

  const properties = await prisma.property.findMany({
    where: {
      ...(city && { city }),
      ...(type && { propertyType: type }),
      ...(listing && { listingType: listing }),
      ...(certifiedOnly && { isCertified: true }),
    },
    include: {
      report: true,
      owner: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ properties });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "بيانات غير صحيحة", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { images, ...rest } = parsed.data;
  const property = await prisma.property.create({
    data: {
      ...rest,
      images: JSON.stringify(images),
      ownerId: session.user.id,
    },
  });

  return NextResponse.json({ property }, { status: 201 });
}
