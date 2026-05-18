"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { routing } from "@/i18n/routing";
import { moderateListing } from "@/lib/moderation";

type Locale = (typeof routing.locales)[number];
type Status = "active" | "paused" | "sold";

const FUEL_KEYS = ["diesel", "petrol", "hybrid", "electric"] as const;
const TRANSMISSION_KEYS = ["auto", "manual"] as const;
const BODY_KEYS = ["sedan", "suv", "wagon", "hatchback", "coupe"] as const;
const DRIVE_KEYS = ["fwd", "rwd", "awd"] as const;
const CONDITION_KEYS = ["new", "used", "damaged"] as const;

function pickLocale(value: FormDataEntryValue | null): Locale {
  const v = typeof value === "string" ? value : "";
  return (routing.locales as readonly string[]).includes(v)
    ? (v as Locale)
    : (routing.defaultLocale as Locale);
}

function pickId(formData: FormData): string | null {
  const v = formData.get("listing_id");
  if (typeof v !== "string") return null;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)
    ? v
    : null;
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

function oneOf<T extends string>(value: string, allowed: readonly T[]): T | null {
  return (allowed as readonly string[]).includes(value) ? (value as T) : null;
}

async function changeStatus(formData: FormData, status: Status) {
  const locale = pickLocale(formData.get("locale"));
  const id = pickId(formData);
  if (!id) redirect(`/${locale}/account/listings?action=error`);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  // RLS gates this — UPDATE only if user_id = auth.uid()
  const { error } = await supabase
    .from("listings")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    redirect(`/${locale}/account/listings?action=error`);
  }

  revalidatePath(`/${locale}/account/listings`);
  redirect(`/${locale}/account/listings?action=${status}`);
}

export async function pauseListingAction(formData: FormData) {
  return changeStatus(formData, "paused");
}

export async function resumeListingAction(formData: FormData) {
  return changeStatus(formData, "active");
}

export async function markSoldAction(formData: FormData) {
  return changeStatus(formData, "sold");
}

export async function deleteListingAction(formData: FormData) {
  const locale = pickLocale(formData.get("locale"));
  const id = pickId(formData);
  if (!id) redirect(`/${locale}/account/listings?action=error`);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  // 1. List photos for storage cleanup before DB delete (cascade removes
  //    listing_photos rows but storage objects need explicit removal).
  const { data: photos } = await supabase
    .from("listing_photos")
    .select("storage_path")
    .eq("listing_id", id);

  // 2. Delete listing row (RLS verifies ownership; cascades to listing_photos)
  const { error } = await supabase
    .from("listings")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    redirect(`/${locale}/account/listings?action=error`);
  }

  // 3. Best-effort storage cleanup. Failure here doesn't break the delete —
  //    listing is already gone from the catalog.
  const paths = (photos ?? [])
    .map((p) => (p as { storage_path: string }).storage_path)
    .filter(
      (p): p is string =>
        typeof p === "string" && p.startsWith(`${user.id}/${id}/`)
    );
  if (paths.length > 0) {
    await supabase.storage.from("listings").remove(paths);
  }

  revalidatePath(`/${locale}/account/listings`);
  redirect(`/${locale}/account/listings?action=deleted`);
}

export async function updateListingAction(formData: FormData) {
  const locale = pickLocale(formData.get("locale"));
  const id = pickId(formData);
  if (!id) redirect(`/${locale}/account/listings?action=error`);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  // Parse + validate (same shape as create, but for an existing row)
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
    redirect(`/${locale}/account/listings/${id}/edit?error=missing_fields`);
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

  // Content moderation — same filter as on create
  const mod = moderateListing({ title: `${brand} ${model}`, description });
  if (!mod.ok) {
    redirect(
      `/${locale}/account/listings/${id}/edit?error=moderation_${mod.reason}`
    );
  }

  const { error } = await supabase
    .from("listings")
    .update({
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
      price_negotiable,
      condition,
      customs_cleared,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    const msg = encodeURIComponent(error.message);
    redirect(
      `/${locale}/account/listings/${id}/edit?error=server&msg=${msg}`
    );
  }

  // 4. Photo changes: removed_photo_ids + new_photo_paths
  let removedIds: string[] = [];
  let newPaths: string[] = [];
  const removedRaw = str(formData, "removed_photo_ids");
  const newPathsRaw = str(formData, "new_photo_paths");
  if (removedRaw) {
    try {
      const parsed = JSON.parse(removedRaw);
      if (Array.isArray(parsed)) {
        removedIds = parsed.filter(
          (x): x is string =>
            typeof x === "string" &&
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(x)
        );
      }
    } catch {
      // ignore
    }
  }
  if (newPathsRaw) {
    try {
      const parsed = JSON.parse(newPathsRaw);
      if (Array.isArray(parsed)) {
        newPaths = parsed.filter(
          (x): x is string => typeof x === "string" && x.length > 0
        );
      }
    } catch {
      // ignore
    }
  }

  if (removedIds.length > 0) {
    // Fetch storage_paths first for cleanup
    const { data: removingRows } = await supabase
      .from("listing_photos")
      .select("storage_path")
      .eq("listing_id", id)
      .in("id", removedIds);

    // Delete the rows (RLS gated via listing.user_id = auth.uid())
    await supabase
      .from("listing_photos")
      .delete()
      .eq("listing_id", id)
      .in("id", removedIds);

    // Best-effort Storage cleanup
    const paths = (removingRows ?? [])
      .map((r) => (r as { storage_path: string }).storage_path)
      .filter((p): p is string => typeof p === "string" && p.length > 0);
    if (paths.length > 0) {
      try {
        await supabase.storage.from("listings").remove(paths);
      } catch {
        // best-effort
      }
    }
  }

  if (newPaths.length > 0) {
    // Compute next position based on what's left after deletions
    const { data: maxRow } = await supabase
      .from("listing_photos")
      .select("position")
      .eq("listing_id", id)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle<{ position: number }>();
    const startPos = (maxRow?.position ?? -1) + 1;

    // If the listing has no photos left, the first new one becomes primary
    const { count: remainingCount } = await supabase
      .from("listing_photos")
      .select("id", { count: "exact", head: true })
      .eq("listing_id", id);
    const noneLeft = (remainingCount ?? 0) === 0;

    const rows = newPaths.slice(0, 15).map((path, i) => ({
      listing_id: id,
      storage_path: path,
      position: startPos + i,
      is_primary: noneLeft && i === 0,
    }));
    await supabase.from("listing_photos").insert(rows);
  }

  revalidatePath(`/${locale}/account/listings`);
  revalidatePath(`/${locale}/listing/${id}`);
  redirect(`/${locale}/listing/${id}?updated=1`);
}
