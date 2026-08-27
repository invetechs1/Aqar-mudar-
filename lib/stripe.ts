import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;

export const stripe = key
  ? new Stripe(key, {
      apiVersion: "2025-02-24.acacia",
    })
  : null;

export function isStripeConfigured(): boolean {
  return !!key;
}
