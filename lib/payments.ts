/**
 * Paid-service activation.
 *
 * There is one paid service: "top" (€5). Activating it pins the listing to
 * the top of the catalog forever, ranked by topped_at (last payer first).
 *
 * Called from:
 *   - the Mollie webhook (real payments, after re-fetching status)
 *   - the create route in mock mode (no webhook fires without MOLLIE_API_KEY)
 *
 * Idempotency is the CALLER's responsibility: only invoke this on the
 * transition INTO 'paid' (i.e. the row wasn't already 'paid'). Re-topping an
 * already-topped listing is fine though — it just refreshes topped_at, which
 * is exactly what paying again should do (jump back to the front).
 */

import type { SupabaseClient } from "@supabase/supabase-js";

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

  if (service_type === "top") {
    if (!listing_id) return;
    const nowIso = new Date().toISOString();
    await admin
      .from("listings")
      .update({ is_top: true, topped_at: nowIso, bumped_at: nowIso })
      .eq("id", listing_id);
    return;
  }

  // Unknown service types carry no structural change.
}
