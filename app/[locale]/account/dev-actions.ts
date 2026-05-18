"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { MOCK_LISTINGS } from "@/lib/mock-listings";
import { routing } from "@/i18n/routing";

type Locale = (typeof routing.locales)[number];

function pickLocale(value: FormDataEntryValue | null): Locale {
  const v = typeof value === "string" ? value : "";
  return (routing.locales as readonly string[]).includes(v)
    ? (v as Locale)
    : (routing.defaultLocale as Locale);
}

/**
 * One-shot dev helper: insert all 30 mock listings owned by the current
 * authenticated user. Idempotent — refuses if the user already owns
 * listings.
 *
 * Uses admin client so RLS is bypassed (we set user_id to current user
 * but seeding directly avoids RLS check overhead and lets us write
 * `created_at`/`bumped_at` to the past).
 */
export async function seedListingsAction(formData: FormData) {
  const locale = pickLocale(formData.get("locale"));

  // 1. Auth via cookie-bound client
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  // 2. Bail if user already has listings
  const { count: existing } = await supabase
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if ((existing ?? 0) > 0) {
    redirect(`/${locale}/account?seed=already_seeded`);
  }

  // 3. Build DB rows from mock data
  const now = Date.now();
  const rows = MOCK_LISTINGS.map((l) => {
    const createdAt = new Date(now - l.daysSincePosted * 86_400_000);
    return {
      user_id: user.id,
      title: `${l.brand} ${l.model}`,
      description: l.details.description.en,
      brand: l.brand,
      model: l.model,
      year: l.year,
      mileage: l.mileageKm,
      fuel_type: l.fuel,
      transmission: l.transmission,
      body_type: l.details.bodyType,
      drive_type: l.details.driveType,
      engine_volume: l.details.engineVolumeL ?? null,
      power_hp: l.details.powerHp,
      color: l.details.color.en,
      country: l.country,
      city: l.city.en,
      price: l.priceEur,
      currency: "EUR",
      price_negotiable: false,
      condition: "used",
      customs_cleared: l.details.customsCleared,
      status: "active",
      is_premium: l.premium,
      premium_until: l.premium
        ? new Date(now + 30 * 86_400_000).toISOString()
        : null,
      is_top: l.badges.includes("top"),
      is_urgent: l.badges.includes("urgent"),
      is_verified: l.badges.includes("verified"),
      views_count: l.details.views,
      favorites_count: l.details.favorites,
      created_at: createdAt.toISOString(),
      bumped_at: createdAt.toISOString(),
    };
  });

  // 4. Insert via admin client (bypass RLS)
  const admin = createAdminClient();
  const { error, count } = await admin
    .from("listings")
    .insert(rows, { count: "exact" });

  if (error) {
    redirect(
      `/${locale}/account?seed=error&msg=${encodeURIComponent(error.message)}`
    );
  }

  redirect(`/${locale}/account?seed=ok&count=${count ?? rows.length}`);
}
