import { NextRequest, NextResponse } from "next/server";
import { getMolliePaymentStatus, type MolliePaymentStatus } from "@/lib/mollie";
import { createAdminClient } from "@/lib/supabase/admin";
import { activatePaidService } from "@/lib/payments";

/**
 * Mollie webhook handler.
 *
 * Mollie POSTs `id=<payment_id>` (application/x-www-form-urlencoded) when a
 * payment status changes. We MUST re-fetch the payment from Mollie and decide
 * what to do — never trust the body alone.
 *
 * On the transition into 'paid' we activate the purchased service exactly once
 * (idempotent: guarded on the row not already being 'paid') and stamp paid_at.
 * Other statuses are mirrored onto the row so the user's payment history stays
 * accurate. We always return 200 so Mollie doesn't retry forever on our errors.
 */

// Mollie status → our payments.status check-constraint values.
const STATUS_MAP: Record<MolliePaymentStatus, string> = {
  open: "pending",
  pending: "pending",
  authorized: "pending",
  paid: "paid",
  failed: "failed",
  canceled: "canceled",
  expired: "expired",
};

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const id = form.get("id");

  if (typeof id !== "string" || id.length === 0) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    const status = await getMolliePaymentStatus(id);
    const mapped = STATUS_MAP[status] ?? "pending";

    const admin = createAdminClient();
    const { data: payment } = await admin
      .from("payments")
      .select("id, user_id, listing_id, service_type, status")
      .eq("mollie_payment_id", id)
      .maybeSingle();

    if (!payment) {
      console.warn("[mollie webhook] no payment row for", id);
      return new NextResponse(null, { status: 200 });
    }

    if (mapped === "paid" && payment.status !== "paid") {
      // First time we see this as paid → grant the service, then mark paid.
      await activatePaidService(admin, payment);
      await admin
        .from("payments")
        .update({ status: "paid", paid_at: new Date().toISOString() })
        .eq("id", payment.id);
    } else if (mapped !== "paid" && payment.status !== "paid") {
      // Keep non-paid statuses in sync, but never downgrade a paid row.
      await admin
        .from("payments")
        .update({ status: mapped })
        .eq("id", payment.id);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[mollie webhook] error", id, message);
    // Still 200: a non-2xx makes Mollie retry. For transient errors that's
    // wasteful; a production-grade impl would persist the raw event for replay.
  }

  return new NextResponse(null, { status: 200 });
}
