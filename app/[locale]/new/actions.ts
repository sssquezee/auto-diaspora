"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { routing } from "@/i18n/routing";
import {
  isValidTier,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_INSERTS,
} from "@/lib/tiers";
import { moderateListing } from "@/lib/moderation";
import {
  sendAdminNotification,
  newListingNotification,
} from "@/lib/telegram";

type Locale = (typeof routing.locales)[number];

function pickLocale(value: FormDataEntryValue | null): Locale {
  const v = typeof value === "string" ? value : "";
  return (routing.locales as readonly string[]).includes(v)
    ? (v as Locale)
    : (routing.defaultLocale as Locale);
}

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function num(formData: FormData, key: string): number | null {
  const v = formData.get(key);
  if (typeof v !== "string" || !v.trim()) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

const FUEL_KEYS = ["diesel", "petrol", "hybrid", "electric"] as const;
const TRANSMISSION_KEYS = ["auto", "manual"] as const;
const BODY_KEYS = ["sedan", "suv", "wagon", "hatchback", "coupe"] as const;
const DRIVE_KEYS = ["fwd", "rwd", "awd"] as const;
const CONDITION_KEYS = ["new", "used", "damaged"] as const;

function oneOf<T extends string>(value: string, allowed: readonly T[]): T | null {
  return (allowed as readonly string[]).includes(value) ? (value as T) : null;
}

export async function createListingAction(formData: FormData) {
  const locale = pickLocale(formData.get("locale"));

  // 1. Auth
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  // 1.5. Parse pre-uploaded photo paths NOW so they can be cleaned up
  //      on any subsequent failure. Without this, a moderation block
  //      (or rate-limit, or validation error) leaves files in Storage
  //      with no DB row pointing at them.
  let photoPaths: string[] = [];
  const photoPathsRaw = str(formData, "photo_paths");
  if (photoPathsRaw) {
    try {
      const parsed = JSON.parse(photoPathsRaw);
      if (Array.isArray(parsed)) {
        photoPaths = parsed.filter(
          (p): p is string => typeof p === "string" && p.length > 0
        );
      }
    } catch {
      // bad JSON — ignore, treat as no photos
    }
  }
  const cleanupOrphans = async () => {
    if (photoPaths.length === 0) return;
    try {
      await supabase.storage.from("listings").remove(photoPaths);
    } catch {
      // best-effort; nothing else to do
    }
  };

  // 2. Parse + validate
  const brand = str(formData, "brand");
  const model = str(formData, "model");
  const year = num(formData, "year");
  const mileage = num(formData, "mileage");
  const fuel = oneOf(str(formData, "fuel_type"), FUEL_KEYS);
  const transmission = oneOf(str(formData, "transmission"), TRANSMISSION_KEYS);
  const country = str(formData, "country");
  const city = str(formData, "city");
  const price = num(formData, "price");

  const missing =
    !brand ||
    !model ||
    year === null ||
    mileage === null ||
    !fuel ||
    !transmission ||
    !country ||
    !city ||
    price === null;

  if (missing) {
    await cleanupOrphans();
    redirect(`/${locale}/new?error=missing_fields`);
  }

  const body_type = oneOf(str(formData, "body_type"), BODY_KEYS);
  const drive_type = oneOf(str(formData, "drive_type"), DRIVE_KEYS);
  const engine_volume = num(formData, "engine_volume");
  const power_hp = num(formData, "power_hp");
  const color = str(formData, "color") || null;
  const vin = str(formData, "vin") || null;
  const description = str(formData, "description") || null;
  const condition =
    oneOf(str(formData, "condition"), CONDITION_KEYS) ?? "used";
  const customs_cleared = str(formData, "customs") === "yes";
  const price_negotiable = formData.get("price_negotiable") === "on";

  const rawTier = str(formData, "tier") || "free";
  const tier = isValidTier(rawTier) ? rawTier : "free";

  // 2.5. Rate-limit: max N new listings per user per minute
  const sinceIso = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
  const { count: recentCount } = await supabase
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", sinceIso);
  if ((recentCount ?? 0) >= RATE_LIMIT_MAX_INSERTS) {
    await cleanupOrphans();
    redirect(`/${locale}/new?error=rate_limit`);
  }

  // 2.7. Content moderation — block obvious spam before insert
  const mod = moderateListing({ title: `${brand} ${model}`, description });
  if (!mod.ok) {
    await cleanupOrphans();
    redirect(`/${locale}/new?error=moderation_${mod.reason}`);
  }

  // 3. Optional client-supplied UUID (when photos were pre-uploaded under
  //    /listings/<userId>/<listingId>/ paths) — must match a UUID format.
  const clientId = str(formData, "listing_id");
  const useClientId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    clientId
  );

  // 4. Insert listing
  const insertPayload: Record<string, unknown> = {
    user_id: user.id,
    title: `${brand} ${model}`,
    description,
    brand,
    model,
    year,
    mileage,
    fuel_type: fuel,
    transmission,
    body_type,
    drive_type,
    engine_volume,
    power_hp,
    color,
    vin,
    country,
    city,
    price,
    currency: "EUR",
    price_negotiable,
    condition,
    customs_cleared,
    // New listings land in moderation queue; admin flips to "active"
    // from /admin/queue (or via Telegram bot).
    status: "pending_review",
  };
  if (useClientId) insertPayload.id = clientId;

  const { data, error } = await supabase
    .from("listings")
    .insert(insertPayload)
    .select("id")
    .single<{ id: string }>();

  if (error || !data) {
    await cleanupOrphans();
    const msg = encodeURIComponent(error?.message ?? "insert failed");
    redirect(`/${locale}/new?error=server&msg=${msg}`);
  }

  // 5. Persist uploaded photo paths (already in Storage at this point)
  if (photoPaths.length > 0) {
    const rows = photoPaths.slice(0, 15).map((path, i) => ({
      listing_id: data.id,
      storage_path: path,
      position: i,
      is_primary: i === 0,
    }));
    await supabase.from("listing_photos").insert(rows);
  }

  // 5.5. Fire-and-forget Telegram notification to admin chat. No-op
  //      when TELEGRAM_BOT_TOKEN / TELEGRAM_ADMIN_CHAT_ID aren't set.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  await sendAdminNotification(
    newListingNotification({
      listingId: data.id,
      brand,
      model,
      year: year!,
      price: price!,
      city,
      country,
      ownerEmail: user.email ?? "—",
      siteUrl,
      locale,
    })
  );

  // 6. If the user chose to boost to top (€5), send them to payment with the
  //    freshly-created listing. Otherwise the free listing is done — it goes
  //    to moderation and the user sees the pending state.
  if (tier === "top") {
    redirect(`/${locale}/new/payment?tier=top&listingId=${data.id}`);
  }

  redirect(`/${locale}/listing/${data.id}?pending=1`);
}
