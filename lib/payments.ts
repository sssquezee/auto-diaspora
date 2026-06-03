/**
 * Paid-service activation. Three paid services:
 *
 *   - top:        single-shot pin. Sets topped_at = now (catalog sorts
 *                 topped_at DESC NULLS LAST → last buyer sits first).
 *   - premium_14: PREMIUM badge + auto-pin for 14 days. Sets is_premium,
 *                 premium_until = now + 14d, AND topped_at = now so the
 *                 same sort order brings it to the front.
 *   - premium_30: same as premium_14, 30 days.
 *
 * Called from:
 *   - the Mollie webhook (real payments, after re-fetching status)
 *   - the create route in mock mode (no webhook fires without MOLLIE_API_KEY)
 *
 * Idempotency is the CALLER's responsibility: only invoke this on the
 * transition INTO 'paid'. Re-running for the same row is safe — it just
 * extends the promotion (which is what re-buying should do).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { PREMIUM_DURATION_DAYS } from "./tiers";

export type ActivatablePayment = {
  id: string;
  user_id: string;
  listing_id: string | null;
  service_type: string;
  status: string;
};

export async function activatePaidService(
  admin: SupabaseClient,
  payment: ActivatablePayment
): Promise<void> {
  const { service_type, listing_id } = payment;
  if (!listing_id) return;

  const nowIso = new Date().toISOString();

  if (service_type === "top") {
    await admin
      .from("listings")
      .update({ is_top: true, topped_at: nowIso, bumped_at: nowIso })
      .eq("id", listing_id);
    return;
  }

  if (service_type === "premium_14" || service_type === "premium_30") {
    const days = PREMIUM_DURATION_DAYS[service_type as "premium_14" | "premium_30"];
    if (!days) return;
    const premiumUntilIso = new Date(
      Date.now() + days * 24 * 60 * 60 * 1000
    ).toISOString();
    await admin
      .from("listings")
      .update({
        is_premium: true,
        premium_until: premiumUntilIso,
        is_top: true,
        topped_at: nowIso,
        bumped_at: nowIso,
      })
      .eq("id", listing_id);
    return;
  }

  // Unknown service types carry no structural change.
}
