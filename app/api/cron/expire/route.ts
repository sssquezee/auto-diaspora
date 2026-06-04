import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Nightly expiry sweep. Clears promotion flags after their *_until has
 * passed:
 *   - is_premium → false when premium_until < now()
 *   - is_top    → false when top_until < now()
 *
 * Without this the catalog top fills with permanently-pinned listings
 * because the Mollie webhook only ever sets the flags ON.
 *
 * Protected by CRON_SECRET (Authorization: Bearer <secret>). Schedule it
 * from the host crontab — Vercel Cron isn't available on this VPS:
 *   0 3 * * * curl -fsS -H "Authorization: Bearer $CRON_SECRET" \
 *     https://autodiaspora.com/api/cron/expire
 */
export async function GET(request: NextRequest) {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured" },
      { status: 503 }
    );
  }

  const got = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "")
    .trim();
  if (got !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const nowIso = new Date().toISOString();

  // Premium expired → drop badge but keep listing live.
  const { count: premiumExpired } = await admin
    .from("listings")
    .update({ is_premium: false }, { count: "exact" })
    .eq("is_premium", true)
    .lt("premium_until", nowIso);

  // Single-shot TOP expired (paid tier has its own top_until; the
  // partner's €5 boost stays pinned via topped_at without a deadline,
  // so we only touch rows that actually have an explicit cutoff).
  const { count: topExpired } = await admin
    .from("listings")
    .update({ is_top: false }, { count: "exact" })
    .eq("is_top", true)
    .not("top_until", "is", null)
    .lt("top_until", nowIso);

  return NextResponse.json({
    ok: true,
    ts: nowIso,
    premium_cleared: premiumExpired ?? 0,
    top_cleared: topExpired ?? 0,
  });
}
