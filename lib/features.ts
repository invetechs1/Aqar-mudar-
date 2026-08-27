/**
 * Product feature flags.
 *
 * These are read at import time from process.env so a Next.js server component
 * can call `features.partialSale` synchronously. Keep values boolean and default
 * to the "safe" side for launch (off).
 *
 * Change history:
 * - PARTIAL_SALE off by default: waiting on CMA/SPV licensing before the
 *   fractional-sale flow can be reactivated. Do not delete the code path.
 */
function envFlag(name: string, fallback = false): boolean {
  const v = process.env[name];
  if (v == null) return fallback;
  return /^(1|true|yes|on)$/i.test(v.trim());
}

export const features = {
  partialSale: envFlag("FEATURE_PARTIAL_SALE", false),
};

export type Features = typeof features;
