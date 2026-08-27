import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.NEXTAUTH_URL;

  const staticPages: MetadataRoute.Sitemap = [
    "",
    "/properties",
    "/about",
    "/contact",
    "/faq",
    "/legal/terms",
    "/legal/privacy",
    "/legal/disclaimer",
    "/legal/risk",
    "/legal/aml",
    "/legal/refund",
  ].map((p) => ({
    url: `${base}${p}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.7,
  }));

  const properties = await prisma.property
    .findMany({
      where: { isCertified: true },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 5000,
    })
    .catch(() => []);

  const propertyPages: MetadataRoute.Sitemap = properties.map((p) => ({
    url: `${base}/properties/${p.id}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...propertyPages];
}
