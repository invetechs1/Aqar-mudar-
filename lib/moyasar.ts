import { env } from "./env";

/**
 * Moyasar API client (KSA payment gateway).
 * Supports Mada, Apple Pay, Visa/Mastercard, STC Pay.
 * https://docs.moyasar.com
 */

const BASE = "https://api.moyasar.com/v1";

function auth(): string {
  if (!env.MOYASAR_SECRET_KEY) throw new Error("MOYASAR_SECRET_KEY not set");
  return "Basic " + Buffer.from(`${env.MOYASAR_SECRET_KEY}:`).toString("base64");
}

export function isMoyasarConfigured(): boolean {
  return !!env.MOYASAR_SECRET_KEY;
}

export type MoyasarPayment = {
  id: string;
  status: string; // "initiated" | "paid" | "failed" | "authorized" | "captured" | "refunded" | "voided"
  amount: number; // halalas
  currency: string;
  description?: string;
  invoice_id?: string;
  source?: Record<string, unknown>;
  metadata?: Record<string, string>;
  callback_url?: string;
  created_at?: string;
};

export async function createPayment(input: {
  amountHalalas: number;
  description: string;
  callbackUrl: string;
  metadata: Record<string, string>;
  sourceType?: "creditcard" | "applepay" | "stcpay";
}): Promise<MoyasarPayment> {
  const body = new URLSearchParams();
  body.set("amount", String(input.amountHalalas));
  body.set("currency", "SAR");
  body.set("description", input.description);
  body.set("callback_url", input.callbackUrl);
  for (const [k, v] of Object.entries(input.metadata)) {
    body.set(`metadata[${k}]`, v);
  }
  const res = await fetch(`${BASE}/payments`, {
    method: "POST",
    headers: {
      Authorization: auth(),
      "content-type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Moyasar create failed: ${res.status} ${err}`);
  }
  return (await res.json()) as MoyasarPayment;
}

export async function getPayment(id: string): Promise<MoyasarPayment> {
  const res = await fetch(`${BASE}/payments/${id}`, {
    headers: { Authorization: auth() },
  });
  if (!res.ok) throw new Error(`Moyasar get failed: ${res.status}`);
  return (await res.json()) as MoyasarPayment;
}

export async function refundPayment(id: string, amountHalalas?: number): Promise<MoyasarPayment> {
  const body = new URLSearchParams();
  if (amountHalalas) body.set("amount", String(amountHalalas));
  const res = await fetch(`${BASE}/payments/${id}/refund`, {
    method: "POST",
    headers: {
      Authorization: auth(),
      "content-type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Moyasar refund failed: ${res.status} ${err}`);
  }
  return (await res.json()) as MoyasarPayment;
}
