/**
 * DB-backed listing reads.
 *
 * Adapts rows from `public.listings` to the existing `Listing` shape from
 * `mock-listings.ts` so UI components keep working unchanged. Fields the
 * DB doesn't store (engineSpec, postedAt label, photoCount, imageVariant,
 * priceUah, seller card) are synthesized here.
 */

import { createClient } from "@/lib/supabase/server";
import type {
  BodyTypeKey,
  DriveTypeKey,
  FuelKey,
  Listing,
  ListingBadge,
  Locale,
  TransmissionKey,
} from "@/lib/mock-listings";
import type { FilterState } from "@/lib/filters";

type DbListing = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  fuel_type: FuelKey;
  transmission: TransmissionKey;
  body_type: BodyTypeKey | null;
  drive_type: DriveTypeKey | null;
  engine_volume: number | null;
  power_hp: number | null;
  color: string | null;
  country: string;
  city: string;
  price: number;
  currency: string;
  customs_cleared: boolean;
  status: string;
  is_premium: boolean;
  is_top: boolean;
  is_urgent: boolean;
  is_verified: boolean;
  views_count: number;
  favorites_count: number;
  created_at: string;
  bumped_at: string;
  listing_photos: Array<{ storage_path: string; position: number }> | null;
};

const LISTING_COLUMNS =
  "id,user_id,title,description,brand,model,year,mileage,fuel_type,transmission,body_type,drive_type,engine_volume,power_hp,color,country,city,price,currency,customs_cleared,status,is_premium,is_top,is_urgent,is_verified,views_count,favorites_count,created_at,bumped_at,listing_photos(storage_path,position)";

const STORAGE_BUCKET = "listings";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

function publicPhotoUrl(storagePath: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${storagePath}`;
}

function hashId(id: string): number {
  let h = 5381;
  for (let i = 0; i < id.length; i++) h = ((h << 5) + h + id.charCodeAt(i)) >>> 0;
  return h;
}

function imageVariantFor(id: string): 1 | 2 | 3 | 4 | 5 | 6 {
  return ((hashId(id) % 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6;
}

function daysSince(iso: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));
}

function postedAtLabels(days: number): Record<Locale, string> {
  if (days === 0) return { uk: "сьогодні", ru: "сегодня", en: "today" };
  if (days === 1) return { uk: "вчора", ru: "вчера", en: "yesterday" };
  if (days < 7) {
    return {
      uk: `${days} дн. тому`,
      ru: `${days} дн. назад`,
      en: `${days} days ago`,
    };
  }
  const weeks = Math.floor(days / 7);
  return {
    uk: `${weeks} тиж. тому`,
    ru: `${weeks} нед. назад`,
    en: `${weeks} wk ago`,
  };
}

function engineSpec(
  volumeL: number | null,
  fuel: FuelKey
): Record<Locale, string> {
  if (fuel === "electric") {
    return { uk: "Електро", ru: "Электро", en: "Electric" };
  }
  const vol = volumeL != null ? `${volumeL.toFixed(1)}` : "—";
  const suffix =
    fuel === "diesel" ? "TDI" : fuel === "hybrid" ? "Hybrid" : "TFSI";
  const text = `${vol} ${suffix}`;
  return { uk: text, ru: text, en: text };
}

function priceUah(eur: number): string {
  // Static FX ~44 UAH per EUR (display-only)
  return `${new Intl.NumberFormat("uk-UA").format(Math.round(eur * 44))} ₴`;
}

function buildBadges(db: DbListing): ListingBadge[] {
  const badges: ListingBadge[] = [];
  if (db.is_top) badges.push("top");
  if (daysSince(db.created_at) < 3 && !db.is_top) badges.push("new");
  if (db.is_urgent) badges.push("urgent");
  if (db.is_verified) badges.push("verified");
  return badges;
}

function dbToListing(db: DbListing): Listing {
  const fuel = db.fuel_type;
  const days = daysSince(db.bumped_at ?? db.created_at);
  const city = db.city || "—";
  const color = db.color || "—";
  const description = db.description ?? "";

  const sortedPhotos = (db.listing_photos ?? [])
    .slice()
    .sort((a, b) => a.position - b.position);
  const photoUrls = sortedPhotos.map((p) => publicPhotoUrl(p.storage_path));

  return {
    id: db.id,
    brand: db.brand,
    model: db.model,
    year: db.year,
    mileageKm: db.mileage,
    engineSpec: engineSpec(db.engine_volume, fuel),
    priceEur: Number(db.price),
    priceUah: priceUah(Number(db.price)),
    fuel,
    transmission: db.transmission,
    country: db.country,
    city: { uk: city, ru: city, en: city },
    photoCount: photoUrls.length > 0 ? photoUrls.length : 1,
    imageVariant: imageVariantFor(db.id),
    photoUrls: photoUrls.length > 0 ? photoUrls : undefined,
    postedAt: postedAtLabels(days),
    daysSincePosted: days,
    badges: buildBadges(db),
    premium: db.is_premium,
    status: db.status as Listing["status"],
    details: {
      bodyType: (db.body_type ?? "sedan") as BodyTypeKey,
      driveType: (db.drive_type ?? "fwd") as DriveTypeKey,
      powerHp: db.power_hp ?? 0,
      engineVolumeL: db.engine_volume ?? undefined,
      color: { uk: color, ru: color, en: color },
      customsCleared: db.customs_cleared,
      description: { uk: description, ru: description, en: description },
      views: db.views_count,
      favorites: db.favorites_count,
      seller: {
        name: "—",
        memberSinceYear: new Date(db.created_at).getFullYear(),
        listingsCount: 1,
        verified: db.is_verified,
      },
    },
  };
}

export async function getActiveListings(): Promise<Listing[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select(LISTING_COLUMNS)
    .eq("status", "active")
    .order("bumped_at", { ascending: false })
    .returns<DbListing[]>();
  if (error) {
    console.error("[listings] getActive failed:", error.message);
    return [];
  }
  return (data ?? []).map(dbToListing);
}

export async function getListingById(id: string): Promise<Listing | null> {
  // UUID sanity check — short-circuit for old mock IDs ("1","5") that
  // localStorage might still hold.
  if (!/^[0-9a-f]{8}-/i.test(id)) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select(LISTING_COLUMNS)
    .eq("id", id)
    .maybeSingle<DbListing>();
  if (error || !data) return null;
  return dbToListing(data);
}

export async function getListingsByIds(ids: string[]): Promise<Listing[]> {
  const uuids = ids.filter((id) => /^[0-9a-f]{8}-/i.test(id));
  if (uuids.length === 0) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select(LISTING_COLUMNS)
    .in("id", uuids)
    .returns<DbListing[]>();
  if (error || !data) return [];

  // Preserve the input order (favorites order matters to the user)
  const byId = new Map(data.map((d) => [d.id, dbToListing(d)]));
  return uuids
    .map((id) => byId.get(id))
    .filter((l): l is Listing => l !== undefined);
}

export async function getMyListings(
  userId: string,
  status?: string
): Promise<Listing[]> {
  const supabase = await createClient();
  let query = supabase
    .from("listings")
    .select(LISTING_COLUMNS)
    .eq("user_id", userId);
  if (status) query = query.eq("status", status);
  const { data, error } = await query
    .order("created_at", { ascending: false })
    .returns<DbListing[]>();
  if (error || !data) return [];
  return data.map(dbToListing);
}

export async function getSimilarListings(
  listing: Listing,
  count: number
): Promise<Listing[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select(LISTING_COLUMNS)
    .eq("status", "active")
    .neq("id", listing.id)
    .or(`brand.eq.${listing.brand},body_type.eq.${listing.details.bodyType}`)
    .limit(30)
    .returns<DbListing[]>();
  if (error || !data) return [];

  const priceLow = listing.priceEur * 0.75;
  const priceHigh = listing.priceEur * 1.25;

  return data
    .map((d) => {
      let score = 0;
      if (d.brand === listing.brand) score += 4;
      if (d.body_type === listing.details.bodyType) score += 2;
      if (d.fuel_type === listing.fuel) score += 1;
      const p = Number(d.price);
      if (p >= priceLow && p <= priceHigh) score += 1;
      return { d, score };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.d.is_premium !== b.d.is_premium) return a.d.is_premium ? -1 : 1;
      return new Date(b.d.bumped_at).getTime() - new Date(a.d.bumped_at).getTime();
    })
    .slice(0, count)
    .map((x) => dbToListing(x.d));
}

/**
 * Catalog + /search read path with all filtering, sorting, and
 * pagination pushed to SQL. Returns the page slice + total count
 * (for the paginator).
 *
 * Replaces the old "fetch all + applyFilters in JS" approach that
 * scaled fine at 30 rows and not at 1000+.
 */
export async function getFilteredListings(
  filters: FilterState,
  pageSize: number
): Promise<{ listings: Listing[]; total: number }> {
  const supabase = await createClient();

  let query = supabase
    .from("listings")
    .select(LISTING_COLUMNS, { count: "exact" })
    .eq("status", "active");

  // Free-text — per token, ILIKE OR across title+brand+model.
  // AND across tokens (each token must match somewhere).
  if (filters.q) {
    const tokens = filters.q
      .toLowerCase()
      .split(/\s+/)
      .map((t) => t.trim().replace(/[%_]/g, "\\$&"))
      .filter(Boolean);
    for (const tok of tokens) {
      const pat = `%${tok}%`;
      query = query.or(
        `title.ilike.${pat},brand.ilike.${pat},model.ilike.${pat}`
      );
    }
  }

  if (filters.brand) query = query.eq("brand", filters.brand);
  if (filters.model) query = query.ilike("model", `${filters.model}%`);
  if (filters.countries && filters.countries.length > 0)
    query = query.in("country", filters.countries);
  if (filters.fuels && filters.fuels.length > 0)
    query = query.in("fuel_type", filters.fuels);
  if (filters.transmissions && filters.transmissions.length > 0)
    query = query.in("transmission", filters.transmissions);
  if (filters.bodyTypes && filters.bodyTypes.length > 0)
    query = query.in("body_type", filters.bodyTypes);

  if (filters.yearFrom !== undefined) query = query.gte("year", filters.yearFrom);
  if (filters.yearTo !== undefined) query = query.lte("year", filters.yearTo);
  if (filters.priceFrom !== undefined)
    query = query.gte("price", filters.priceFrom);
  if (filters.priceTo !== undefined) query = query.lte("price", filters.priceTo);
  if (filters.mileageFrom !== undefined)
    query = query.gte("mileage", filters.mileageFrom);
  if (filters.mileageTo !== undefined)
    query = query.lte("mileage", filters.mileageTo);

  // Sort
  switch (filters.sortBy) {
    case "premium":
      query = query
        .order("is_premium", { ascending: false })
        .order("bumped_at", { ascending: false });
      break;
    case "newest":
      query = query.order("bumped_at", { ascending: false });
      break;
    case "priceAsc":
      query = query.order("price", { ascending: true });
      break;
    case "priceDesc":
      query = query.order("price", { ascending: false });
      break;
    case "mileage":
      query = query.order("mileage", { ascending: true });
      break;
  }

  // Pagination (page is 1-based)
  const offset = Math.max(0, (filters.page - 1) * pageSize);
  query = query.range(offset, offset + pageSize - 1);

  const { data, count, error } = await query.returns<DbListing[]>();
  if (error || !data) {
    console.error("[listings] getFilteredListings failed:", error?.message);
    return { listings: [], total: 0 };
  }
  return { listings: data.map(dbToListing), total: count ?? 0 };
}
