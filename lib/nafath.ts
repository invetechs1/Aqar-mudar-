import { env } from "./env";
import { logger } from "./logger";

/**
 * Nafath (نفاذ) — Saudi national identity verification.
 * https://www.absher.sa/wps/portal/individuals/eservices
 *
 * Nafath is provided by the Saudi National Information Center under Absher.
 * Access requires an official onboarding process for entities. Set the three
 * env vars once you're onboarded; without them, this module runs in MOCK mode
 * that simulates the flow for development.
 */

export function isNafathConfigured(): boolean {
  return !!(env.NAFATH_API_URL && env.NAFATH_CLIENT_ID && env.NAFATH_CLIENT_SECRET);
}

export type NafathRequest = {
  transactionId: string;
  randomNumber: string; // 2-digit code the user picks in the Nafath app
  expiresAt: string;
};

export type NafathResult = {
  verified: boolean;
  nationalId?: string;
  fullNameAr?: string;
  fullNameEn?: string;
  dateOfBirthHijri?: string;
  dateOfBirthGregorian?: string;
};

export async function requestVerification(nationalId: string): Promise<NafathRequest> {
  if (!isNafathConfigured()) {
    logger.warn("nafath_mock_mode", { nationalId });
    return {
      transactionId: `mock-${Date.now()}`,
      randomNumber: String(Math.floor(10 + Math.random() * 90)),
      expiresAt: new Date(Date.now() + 5 * 60_000).toISOString(),
    };
  }
  const res = await fetch(`${env.NAFATH_API_URL}/api/v1/mfa/request`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": env.NAFATH_CLIENT_SECRET!,
    },
    body: JSON.stringify({
      client_id: env.NAFATH_CLIENT_ID,
      national_id: nationalId,
    }),
  });
  if (!res.ok) throw new Error(`Nafath request failed: ${res.status}`);
  return (await res.json()) as NafathRequest;
}

export async function checkVerification(transactionId: string): Promise<NafathResult> {
  if (!isNafathConfigured()) {
    return {
      verified: true,
      nationalId: "1000000000",
      fullNameAr: "مستخدم تجريبي",
      fullNameEn: "Mock User",
      dateOfBirthGregorian: "1990-01-01",
    };
  }
  const res = await fetch(
    `${env.NAFATH_API_URL}/api/v1/mfa/status?transaction_id=${encodeURIComponent(transactionId)}`,
    {
      headers: {
        "x-api-key": env.NAFATH_CLIENT_SECRET!,
      },
    }
  );
  if (!res.ok) throw new Error(`Nafath status failed: ${res.status}`);
  return (await res.json()) as NafathResult;
}
