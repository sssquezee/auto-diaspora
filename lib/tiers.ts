/**
 * Paid services. Four tiers:
 *
 *   - free        — €0, baseline. Publishing is always free.
 *   - top         — €5 single-shot pin. Listing jumps to the top of the
 *                   catalog. Stays there until someone else buys "top"
 *                   later (sort: topped_at DESC NULLS LAST).
 *   - premium_14  — €9.99, PREMIUM badge + auto-pin to top for 14 days.
 *                   Sets premium_until = now + 14d.
 *   - premium_30  — €19.99, same as premium_14 but for 30 days.
 *
 * Activation lives in `lib/payments.ts` (called from Mollie webhook on
 * the open → paid transition, or from create-route in mock mode).
 *
 * DB compatibility: `payments.service_type` CHECK constraint already
 * accepts all values (see supabase/top-boost.sql) and `listings` has the
 * is_premium / premium_until columns from supabase/schema.sql.
 */

export type TierKey = "free" | "top" | "premium_14" | "premium_30";

/**
 * Rate-limit window for create-listing. Max N listings per user in the
 * trailing minute. Blocks scripted spam without bothering humans.
 */
export const RATE_LIMIT_WINDOW_MS = 60_000;
export const RATE_LIMIT_MAX_INSERTS = 5;

/** Legacy single-tier price constant — kept so existing imports keep building. */
export const TOP_PRICE_EUR = 5;

export const TIER_PRICES_EUR: Record<TierKey, number> = {
  free: 0,
  top: 5,
  premium_14: 9.99,
  premium_30: 19.99,
};

/**
 * Mollie service_type field. Must match the `payments_service_type_check`
 * constraint values (see supabase/top-boost.sql).
 */
export const TIER_SERVICE_TYPE: Record<TierKey, string> = {
  free: "free",
  top: "top",
  premium_14: "premium_14",
  premium_30: "premium_30",
};

/** Premium duration in days (used to compute premium_until on activation). */
export const PREMIUM_DURATION_DAYS: Partial<Record<TierKey, number>> = {
  premium_14: 14,
  premium_30: 30,
};

/** Ordered list for UI rendering (Pricing page, dropdowns, etc). */
export const TIER_ORDER: TierKey[] = [
  "free",
  "top",
  "premium_14",
  "premium_30",
];

/** Paid tiers only (skip free) — convenient for promote dropdowns. */
export const PAID_TIERS: Exclude<TierKey, "free">[] = [
  "top",
  "premium_14",
  "premium_30",
];

export function isPaidTier(tier: TierKey): boolean {
  return TIER_PRICES_EUR[tier] > 0;
}

export function isValidTier(value: string): value is TierKey {
  return (
    value === "free" ||
    value === "top" ||
    value === "premium_14" ||
    value === "premium_30"
  );
}
