import { NextRequest, NextResponse } from "next/server";
import { createMolliePayment } from "@/lib/mollie";
import { isValidTier } from "@/lib/tiers";

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

  const locale = body.locale ?? "uk";
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  const host = request.headers.get("host") ?? "localhost:3000";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? `${proto}://${host}`;

  // TODO (once Supabase is wired):
  //   1. Authenticate request (currently anyone can call)
  //   2. INSERT INTO payments (user_id, listing_id, mollie_payment_id, amount, currency,
  //      status='pending', service_type) — use result.paymentId after Mollie call
  //   3. Tie listingId to the payment so the webhook can activate the right listing

  try {
    const result = await createMolliePayment({
      tier: body.tier,
      listingId: body.listingId,
      locale,
      siteUrl,
    });
    return NextResponse.json({
      checkoutUrl: result.checkoutUrl,
      paymentId: result.paymentId,
      mock: result.mock,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
