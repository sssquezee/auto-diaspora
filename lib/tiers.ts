/**
 * Paid services.
 *
 * There is exactly ONE paid service: "top" — a €5 boost that pins the
 * listing above all non-paid ones, forever. Whoever pays last sits first
 * among the topped listings (see lib/listings sorting: topped_at DESC).
 * Publishing a listing is always free.
 */

export type TierKey = "free" | "top";

/**
 * Rate-limit window for create-listing. Max N listings per user in the
 * trailing minute. Blocks scripted spam without bothering humans.
 */
export const RATE_LIMIT_WINDOW_MS = 60_000;
export const RATE_LIMIT_MAX_INSERTS = 5;

export const TOP_PRICE_EUR = 5;

export const TIER_PRICES_EUR: Record<TierKey, number> = {
  free: 0,
  top: TOP_PRICE_EUR,
};

/** Mollie service_type field (matches payments.service_type check). */
export const TIER_SERVICE_TYPE: Record<TierKey, string> = {
  free: "free",
  top: "top",
};

export function isPaidTier(tier: TierKey): boolean {
  return TIER_PRICES_EUR[tier] > 0;
}

export function isValidTier(value: string): value is TierKey {
  return value === "free" || value === "top";
}
