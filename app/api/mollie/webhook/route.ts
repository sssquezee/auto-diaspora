import { NextRequest, NextResponse } from "next/server";
import { getMolliePaymentStatus } from "@/lib/mollie";

/**
 * Mollie webhook handler.
 *
 * Mollie POSTs `id=<payment_id>` (application/x-www-form-urlencoded) when a
 * payment status changes. We MUST then fetch the payment from Mollie and
 * decide what to do — never trust the body alone.
 *
 * Currently a stub: it logs the id and returns 200. Wire-up tasks once
 * Supabase + MOLLIE_API_KEY are set:
 *   1. SELECT payment row by mollie_payment_id
 *   2. If new status is 'paid' and we haven't already activated:
 *      - bump:        UPDATE listings SET bumped_at = now()
 *      - premium_14:  UPDATE listings SET is_premium=true, premium_until=now()+14d
 *      - premium_30:  UPDATE listings SET is_premium=true, premium_until=now()+30d
 *      - extra_listing: UPDATE profiles SET free_listings_used = free_listings_used - 1 (or similar)
 *   3. UPDATE payments.status, payments.paid_at = now() (idempotent)
 *   4. Optionally send a Telegram / email confirmation
 */
export async function POST(request: NextRequest) {
  const form = await request.formData();
  const id = form.get("id");

  if (typeof id !== "string" || id.length === 0) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    const status = await getMolliePaymentStatus(id);
    // eslint-disable-next-line no-console
    console.log("[mollie webhook] payment", id, "status", status);
    // TODO: persist + activate as described above.
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    // eslint-disable-next-line no-console
    console.error("[mollie webhook] error", id, message);
    // Still return 200 — Mollie retries on non-2xx; we don't want infinite retries
    // for a transient error, but we MUST not lose the event. Real impl should
    // store the unprocessed event for later retry instead of swallowing.
  }

  return new NextResponse(null, { status: 200 });
}
