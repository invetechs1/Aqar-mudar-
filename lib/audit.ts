import { prisma } from "./prisma";
import { logger } from "./logger";

type AuditInput = {
  action: string;
  resource: string;
  resourceId?: string | null;
  userId?: string | null;
  metadata?: Record<string, unknown>;
  request?: Request;
};

export async function audit({
  action,
  resource,
  resourceId,
  userId,
  metadata,
  request,
}: AuditInput): Promise<void> {
  try {
    let ip: string | undefined;
    let userAgent: string | undefined;
    if (request) {
      const fwd = request.headers.get("x-forwarded-for") ?? "";
      ip = fwd.split(",")[0]?.trim() || request.headers.get("x-real-ip") || undefined;
      userAgent = request.headers.get("user-agent") ?? undefined;
    }
    await prisma.auditLog.create({
      data: {
        action,
        resource,
        resourceId: resourceId ?? null,
        userId: userId ?? null,
        metadata: metadata as any,
        ip,
        userAgent,
      },
    });
  } catch (e) {
    logger.warn("audit_log_failed", { action, resource, error: String(e) });
  }
}
