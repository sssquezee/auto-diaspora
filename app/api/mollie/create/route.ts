import { NextRequest, NextResponse } from "next/server";
import { createMolliePayment } from "@/lib/mollie";
import { isValidTier, TIER_PRICES_EUR, TIER_SERVICE_TYPE } from "@/lib/tiers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { activatePaidService } from "@/lib/payments";

export async function POST(request: NextRequest) {
  let body: { tier?: string; listingId?: string; locale?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.tier || !isValidTier(body.tier)) {
    return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
  }
  if (body.tier === "free") {
    return NextResponse.json({ error: "Free tier needs no payment" }, { status: 400 });
  }
  const tier = body.tier;

  // Authenticate — anyone calling this is about to be charged, so they must
  // be the logged-in owner of the listing they're upgrading.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // If a listing is targeted, it must belong to the caller.
  const listingId =
    typeof body.listingId === "string" && body.listingId.length > 0
      ? body.listingId
      : undefined;
  if (listingId) {
    const { data: listing } = await supabase
      .from("listings")
      .select("id")
      .eq("id", listingId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }
  }

  const locale = body.locale ?? "uk";
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  const host = request.headers.get("host") ?? "localhost:3000";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? `${proto}://${host}`;

  let result;
  try {
    result = await createMolliePayment({ tier, listingId, locale, siteUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  // Record the payment (service-role: `payments` has no INSERT RLS policy).
  const admin = createAdminClient();
  const { data: payment, error: payErr } = await admin
    .from("payments")
    .insert({
      user_id: user.id,
      listing_id: listingId ?? null,
      mollie_payment_id: result.paymentId,
      amount: TIER_PRICES_EUR[tier],
      currency: "EUR",
      status: "pending",
      service_type: TIER_SERVICE_TYPE[tier],
    })
    .select("id, user_id, listing_id, service_type, status")
    .single();

  if (payErr || !payment) {
    return NextResponse.json(
      { error: "Could not record payment" },
      { status: 500 }
    );
  }

  // Mock mode (no MOLLIE_API_KEY) never receives a webhook, so activate the
  // service here to keep the demo flow working end-to-end. Real payments are
  // activated by /api/mollie/webhook after Mollie confirms 'paid'.
  if (result.mock) {
    await activatePaidService(admin, payment);
    await admin
      .from("payments")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("id", payment.id);
  }

  return NextResponse.json({
    checkoutUrl: result.checkoutUrl,
    paymentId: result.paymentId,
    mock: result.mock,
  });
}
