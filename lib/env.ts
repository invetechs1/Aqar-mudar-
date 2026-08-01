import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  DATABASE_URL: z.string().url(),

  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(16, "NEXTAUTH_SECRET must be at least 16 chars"),

  // Storage
  STORAGE_DRIVER: z.enum(["local", "s3"]).default("local"),
  S3_ENDPOINT: z.string().url().optional(),
  S3_REGION: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_PUBLIC_URL: z.string().url().optional(),

  // Email
  EMAIL_DRIVER: z.enum(["console", "resend"]).default("console"),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default("Aqar Mudar <noreply@aqarmudar.sa>"),

  // SMS
  SMS_DRIVER: z.enum(["console", "twilio"]).default("console"),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_FROM: z.string().optional(),

  // Payments
  MOYASAR_SECRET_KEY: z.string().optional(),
  MOYASAR_PUBLISHABLE_KEY: z.string().optional(),
  MOYASAR_WEBHOOK_SECRET: z.string().optional(),

  STRIPE_SECRET_KEY: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Monitoring
  SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),

  // Analytics
  NEXT_PUBLIC_GA_ID: z.string().optional(),

  // Nafath (mock in dev, real in prod)
  NAFATH_API_URL: z.string().url().optional(),
  NAFATH_CLIENT_ID: z.string().optional(),
  NAFATH_CLIENT_SECRET: z.string().optional(),
});

type EnvSchema = z.infer<typeof schema>;

function loadEnv(): EnvSchema {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    if (process.env.NODE_ENV === "production") {
      console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
      throw new Error("Environment validation failed. See errors above.");
    } else {
      console.warn(
        "⚠️  Some environment variables are invalid or missing (running in dev):",
        parsed.error.flatten().fieldErrors
      );
      return schema.parse({
        NODE_ENV: process.env.NODE_ENV ?? "development",
        DATABASE_URL: process.env.DATABASE_URL ?? "postgresql://user:pass@localhost:5432/db",
        NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? "http://localhost:3000",
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ?? "dev-only-secret-change-me-immediately",
      });
    }
  }
  return parsed.data;
}

export const env = loadEnv();
