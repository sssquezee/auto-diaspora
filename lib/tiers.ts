/**
 * Premium tier pricing for Mollie payments.
 * Mirrors NewListing.tiers translations.
 */

export type TierKey = "free" | "bump" | "premium14" | "premium30";

export const TIER_PRICES_EUR: Record<TierKey, number> = {
  free: 0,
  bump: 4.99,
  premium14: 9.99,
  premium30: 19.99,
};

/** Days the upgrade lasts (0 for one-time bump, undefined for free). */
export const TIER_DURATION_DAYS: Record<TierKey, number | undefined> = {
  free: undefined,
  bump: 0,
  premium14: 14,
  premium30: 30,
};

/** Mollie service_type field (matches PROJECT_SPEC.md payments.service_type). */
export const TIER_SERVICE_TYPE: Record<TierKey, string> = {
  free: "free",
  bump: "bump",
  premium14: "premium_14",
  premium30: "premium_30",
};

export function isPaidTier(tier: TierKey): boolean {
  return TIER_PRICES_EUR[tier] > 0;
}

export function isValidTier(value: string): value is TierKey {
  return value === "free" || value === "bump" || value === "premium14" || value === "premium30";
}
