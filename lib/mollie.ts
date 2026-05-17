/**
 * Mollie service wrapper.
 * Live implementation is gated on MOLLIE_API_KEY + Supabase being wired up.
 * Until then, createMolliePayment() returns a mock checkout URL that
 * routes back to our own success page (?simulated=1).
 */

import { TIER_PRICES_EUR, TIER_SERVICE_TYPE, type TierKey } from "./tiers";

const MOLLIE_API_BASE = "https://api.mollie.com/v2";

export type CreatePaymentInput = {
  tier: TierKey;
  listingId?: string;
  locale: string;
  /** Absolute base URL of our site, e.g. https://autodiaspora.com */
  siteUrl: string;
};

export type CreatePaymentResult = {
  /** Mollie payment id (`tr_xxx`) or a synthetic stub like `mock_xxx`. */
  paymentId: string;
  /** URL to redirect the user to (Mollie checkout or our mock success). */
  checkoutUrl: string;
  /** True when we returned a stub instead of hitting Mollie. */
  mock: boolean;
};

export function isMollieConfigured(): boolean {
  return !!process.env.MOLLIE_API_KEY && process.env.MOLLIE_API_KEY.length > 0;
}

/**
 * Create a payment. When Mollie isn't configured, returns a mock
 * checkout URL that takes the user straight to our success page.
 *
 * When MOLLIE_API_KEY is set and Supabase is wired:
 *   - Insert payment row in `payments` (status=pending, service_type, amount)
 *   - Call POST /payments on Mollie REST API
 *   - Save returned id back to `payments.mollie_payment_id`
 *   - Return Mollie's checkout URL (_links.checkout.href)
 */
export async function createMolliePayment(
  input: CreatePaymentInput
): Promise<CreatePaymentResult> {
  const amount = TIER_PRICES_EUR[input.tier];
  const serviceType = TIER_SERVICE_TYPE[input.tier];

  if (!isMollieConfigured()) {
    const paymentId = `mock_${input.tier}_${Date.now()}`;
    const checkoutUrl = `/${input.locale}/new/payment/success?tier=${input.tier}&simulated=1&pid=${paymentId}`;
    return { paymentId, checkoutUrl, mock: true };
  }

  // === Real Mollie path — wired once MOLLIE_API_KEY + Supabase are set ===
  const body = {
    amount: { currency: "EUR", value: amount.toFixed(2) },
    description: `Auto Diaspora — ${serviceType}`,
    redirectUrl: `${input.siteUrl}/${input.locale}/new/payment/success?tier=${input.tier}`,
    cancelUrl: `${input.siteUrl}/${input.locale}/new/payment/cancel?tier=${input.tier}`,
    webhookUrl: `${input.siteUrl}/api/mollie/webhook`,
    metadata: {
      tier: input.tier,
      listingId: input.listingId,
      serviceType,
    },
  };

  const res = await fetch(`${MOLLIE_API_BASE}/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.MOLLIE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Mollie createPayment failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as {
    id: string;
    _links: { checkout: { href: string } };
  };

  return {
    paymentId: data.id,
    checkoutUrl: data._links.checkout.href,
    mock: false,
  };
}

export type MolliePaymentStatus =
  | "open"
  | "canceled"
  | "pending"
  | "authorized"
  | "expired"
  | "failed"
  | "paid";

/**
 * Fetch payment status from Mollie. Used by the webhook handler and the
 * return URL handler to verify before activating the service. Mock mode
 * always returns "paid" so the success page works during stub demos.
 */
export async function getMolliePaymentStatus(
  paymentId: string
): Promise<MolliePaymentStatus> {
  if (!isMollieConfigured() || paymentId.startsWith("mock_")) {
    return "paid";
  }
  const res = await fetch(`${MOLLIE_API_BASE}/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${process.env.MOLLIE_API_KEY}` },
  });
  if (!res.ok) {
    throw new Error(`Mollie getPayment failed: ${res.status}`);
  }
  const data = (await res.json()) as { status: MolliePaymentStatus };
  return data.status;
}
