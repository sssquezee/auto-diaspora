/**
 * Premium tier pricing for Mollie payments.
 * Mirrors NewListing.tiers translations.
 */

export type TierKey = "free" | "bump" | "premium14" | "premium30";

/**
 * How many active free listings a single user may keep at once. Paid
 * tiers (bump, premium14, premium30) bypass this cap entirely — the
 * idea: the marketplace is free up to N posts, beyond that you pay
 * for either promotion or just for the extra slot.
 */
export const FREE_LISTING_LIMIT = 3;

/**
 * Rate-limit window for create-listing. Max N listings per user in the
 * trailing minute. Blocks scripted spam without bothering humans.
 */
export const RATE_LIMIT_WINDOW_MS = 60_000;
export const RATE_LIMIT_MAX_INSERTS = 5;

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
