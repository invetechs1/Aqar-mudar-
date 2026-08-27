import { prisma } from "./prisma";

/**
 * Legal-consent recording.
 *
 * Each clause the user ticked is written as its own row so the record can be
 * audited later ("did the user agree to X on Y date under document version Z?").
 * Never collapse them into a single boolean — that erases what was actually
 * agreed to.
 */

export type ConsentScope = "SIGNUP" | "PROPERTY_ATTESTATION" | "INVEST_ACK";

export const DOCUMENT_VERSIONS = {
  terms:      "2026-08-01",
  privacy:    "2026-08-01",
  disclaimer: "2026-08-01",
  risk:       "2026-08-01",
  aml:        "2026-08-01",
  refund:     "2026-08-01",
} as const;

export type DocumentSlug = keyof typeof DOCUMENT_VERSIONS;

export const REQUIRED_CLAUSES: Record<ConsentScope, readonly string[]> = {
  SIGNUP: ["terms", "privacy", "disclaimer"],
  PROPERTY_ATTESTATION: ["owner_or_agent", "data_accuracy"],
  INVEST_ACK: [
    "read_terms",
    "read_privacy",
    "read_disclaimer",
    "read_risk",
    "capital_loss",
    "estimates_not_guaranteed",
    "report_scope",
    "no_platform_advice",
    "independent_inspection",
    "source_of_funds",
    "electronic_logging",
  ],
} as const;

type RequestLike = { headers: { get(name: string): string | null } };

function clientIp(req?: RequestLike): string | undefined {
  if (!req) return undefined;
  const fwd = req.headers.get("x-forwarded-for") ?? "";
  return fwd.split(",")[0]?.trim() || req.headers.get("x-real-ip") || undefined;
}

export async function recordConsent(input: {
  userId: string;
  scope: ConsentScope;
  clauseKey: string;
  documentSlug?: DocumentSlug;
  scopeRefId?: string;
  request?: RequestLike;
}): Promise<void> {
  await prisma.consent.create({
    data: {
      userId: input.userId,
      scope: input.scope,
      clauseKey: input.clauseKey,
      documentSlug: input.documentSlug ?? null,
      documentVersion: input.documentSlug ? DOCUMENT_VERSIONS[input.documentSlug] : null,
      scopeRefId: input.scopeRefId ?? null,
      ip: clientIp(input.request),
      userAgent: input.request?.headers.get("user-agent") ?? null,
    },
  });
}

export async function recordConsentBatch(input: {
  userId: string;
  scope: ConsentScope;
  clauses: { key: string; documentSlug?: DocumentSlug }[];
  scopeRefId?: string;
  request?: RequestLike;
}): Promise<void> {
  const now = new Date();
  const ip = clientIp(input.request);
  const userAgent = input.request?.headers.get("user-agent") ?? null;
  await prisma.consent.createMany({
    data: input.clauses.map((c) => ({
      userId: input.userId,
      scope: input.scope,
      clauseKey: c.key,
      documentSlug: c.documentSlug ?? null,
      documentVersion: c.documentSlug ? DOCUMENT_VERSIONS[c.documentSlug] : null,
      scopeRefId: input.scopeRefId ?? null,
      ip,
      userAgent,
      createdAt: now,
    })),
  });
}

/**
 * Returns true only when the user has a consent row for every required clause
 * matching the current document version.
 */
export async function hasCompleteConsent(input: {
  userId: string;
  scope: ConsentScope;
  scopeRefId?: string;
}): Promise<boolean> {
  const required = REQUIRED_CLAUSES[input.scope];
  const rows = await prisma.consent.findMany({
    where: {
      userId: input.userId,
      scope: input.scope,
      ...(input.scopeRefId && { scopeRefId: input.scopeRefId }),
      clauseKey: { in: [...required] },
    },
    select: { clauseKey: true, documentSlug: true, documentVersion: true },
  });
  const currentByClause = new Map<string, boolean>();
  for (const key of required) currentByClause.set(key, false);
  for (const r of rows) {
    if (r.documentSlug) {
      const wanted = DOCUMENT_VERSIONS[r.documentSlug as DocumentSlug];
      if (r.documentVersion !== wanted) continue;
    }
    currentByClause.set(r.clauseKey, true);
  }
  return required.every((c) => currentByClause.get(c));
}
