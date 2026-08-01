import { env } from "./env";
import { logger } from "./logger";

async function sendConsole(to: string, message: string): Promise<void> {
  logger.info("sms_stub", { to, message });
  console.log(`\n────── SMS to ${to} ──────\n${message}\n──────────────────────────\n`);
}

async function sendTwilio(to: string, message: string): Promise<void> {
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_FROM) {
    throw new Error("Twilio not configured");
  }
  const auth = Buffer.from(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`).toString("base64");
  const params = new URLSearchParams({ From: env.TWILIO_FROM, To: to, Body: message });
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "content-type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    }
  );
  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Twilio failed: ${res.status} ${err}`);
  }
}

export async function sendSMS(to: string, message: string): Promise<void> {
  if (env.SMS_DRIVER === "twilio") return sendTwilio(to, message);
  return sendConsole(to, message);
}
