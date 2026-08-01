import { prisma } from "./prisma";

type Result = { allowed: boolean; remaining: number; resetAt: Date };

/**
 * Simple DB-backed sliding window rate limiter.
 * For high-traffic production, replace with Redis (Upstash) or Cloudflare Turnstile.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<Result> {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + windowSeconds * 1000);

  const record = await prisma.rateLimit.findUnique({ where: { key } });

  if (!record || record.windowEnd < now) {
    await prisma.rateLimit.upsert({
      where: { key },
      create: { key, count: 1, windowEnd },
      update: { count: 1, windowEnd },
    });
    return { allowed: true, remaining: limit - 1, resetAt: windowEnd };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: record.windowEnd };
  }

  const updated = await prisma.rateLimit.update({
    where: { key },
    data: { count: { increment: 1 } },
  });

  return {
    allowed: true,
    remaining: Math.max(0, limit - updated.count),
    resetAt: record.windowEnd,
  };
}

export function clientKey(req: Request, scope: string): string {
  const fwd = req.headers.get("x-forwarded-for") ?? "";
  const ip = fwd.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  return `${scope}:${ip}`;
}
