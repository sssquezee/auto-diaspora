"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { routing } from "@/i18n/routing";
import { moderateListing } from "@/lib/moderation";

type Locale = (typeof routing.locales)[number];
type Status = "active" | "paused" | "sold";

const CATEGORY_KEYS = ["car", "moto", "commercial", "trailer", "parts"] as const;
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
  const category = oneOf(str(formData, "category"), CATEGORY_KEYS) ?? "car";
  const isVehicle = category !== "parts";
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
    (isVehicle && (year === null || mileage === null || !fuel || !transmission)) ||
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
      category,
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

  // 4. Photo changes: removed_photo_ids + photo_order
  //    photo_order is the full final sequence (existing kept by id, new by
  //    Storage path). Its index = position; index 0 = primary.
  const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  type OrderEntry =
    | { kind: "existing"; id: string }
    | { kind: "new"; path: string };
  let removedIds: string[] = [];
  let photoOrder: OrderEntry[] = [];

  const removedRaw = str(formData, "removed_photo_ids");
  if (removedRaw) {
    try {
      const parsed = JSON.parse(removedRaw);
      if (Array.isArray(parsed)) {
        removedIds = parsed.filter(
          (x): x is string => typeof x === "string" && UUID_RE.test(x)
        );
      }
    } catch {
      // ignore
    }
  }

  const orderRaw = str(formData, "photo_order");
  if (orderRaw) {
    try {
      const parsed = JSON.parse(orderRaw);
      if (Array.isArray(parsed)) {
        // New paths must live inside this user's folder for this listing —
        // never trust a client-supplied arbitrary Storage path.
        const prefix = `${user.id}/${id}/`;
        photoOrder = parsed.flatMap((x): OrderEntry[] => {
          if (
            x &&
            x.kind === "existing" &&
            typeof x.id === "string" &&
            UUID_RE.test(x.id)
          ) {
            return [{ kind: "existing", id: x.id }];
          }
          if (
            x &&
            x.kind === "new" &&
            typeof x.path === "string" &&
            x.path.startsWith(prefix)
          ) {
            return [{ kind: "new", path: x.path }];
          }
          return [];
        });
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

  if (photoOrder.length > 0) {
    const orderCapped = photoOrder.slice(0, 15);

    // Insert the newly-uploaded photos at their target position.
    const newRows = orderCapped
      .map((entry, i) => ({ entry, i }))
      .filter(
        (e): e is { entry: Extract<OrderEntry, { kind: "new" }>; i: number } =>
          e.entry.kind === "new"
      )
      .map(({ entry, i }) => ({
        listing_id: id,
        storage_path: entry.path,
        position: i,
        is_primary: i === 0,
      }));
    if (newRows.length > 0) {
      await supabase.from("listing_photos").insert(newRows);
    }

    // Re-position the existing photos that were kept, so dragging in the
    // editor actually persists.
    for (let i = 0; i < orderCapped.length; i++) {
      const entry = orderCapped[i];
      if (entry.kind === "existing") {
        await supabase
          .from("listing_photos")
          .update({ position: i, is_primary: i === 0 })
          .eq("listing_id", id)
          .eq("id", entry.id);
      }
    }
  }

  revalidatePath(`/${locale}/account/listings`);
  revalidatePath(`/${locale}/listing/${id}`);
  redirect(`/${locale}/listing/${id}?updated=1`);
}
