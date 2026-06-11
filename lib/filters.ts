/**
 * URL-driven filter state for the catalog.
 * Convention: multi-value fields use CSV in the URL (?country=DE,PL).
 */

import type {
  Listing,
  FuelKey,
  TransmissionKey,
  BodyTypeKey,
  VehicleCategory,
} from "./mock-listings";
import { listingMatchesModel } from "./brands";

export type SortKey =
  | "premium"
  | "newest"
  | "priceAsc"
  | "priceDesc"
  | "mileage";

export const DEFAULT_SORT: SortKey = "premium";
const SORT_KEYS: SortKey[] = ["premium", "newest", "priceAsc", "priceDesc", "mileage"];
const FUEL_KEYS: FuelKey[] = ["diesel", "petrol", "hybrid", "electric"];
const TRANSMISSION_KEYS: TransmissionKey[] = ["auto", "manual"];
const BODY_KEYS: BodyTypeKey[] = ["sedan", "suv", "wagon", "hatchback", "coupe"];
const COUNTRY_CODES = ["DE", "PL", "NL", "CZ", "BE", "FR"] as const;
const CATEGORY_KEYS: VehicleCategory[] = ["car", "moto", "commercial", "trailer", "parts"];

export type FilterState = {
  /** Free-text query — matched against brand + model. */
  q?: string;
  /** Top-level vehicle category (nav tabs). Undefined = all categories. */
  category?: VehicleCategory;
  brand?: string;
  model?: string;
  countries?: string[];
  fuels?: FuelKey[];
  transmissions?: TransmissionKey[];
  bodyTypes?: BodyTypeKey[];
  yearFrom?: number;
  yearTo?: number;
  priceFrom?: number;
  priceTo?: number;
  mileageFrom?: number;
  mileageTo?: number;
  sortBy: SortKey;
  page: number;
};

// === Parsing helpers ===

type RawValue = string | string[] | undefined;

function pickString(v: RawValue): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v && v.length > 0 ? v : undefined;
}

function pickNumber(v: RawValue): number | undefined {
  const s = pickString(v);
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

function pickList<T extends string>(
  v: RawValue,
  allowed: readonly T[]
): T[] | undefined {
  const s = pickString(v);
  if (!s) return undefined;
  const parts = s.split(",").map((p) => p.trim()).filter(Boolean);
  const valid = parts.filter((p): p is T => (allowed as readonly string[]).includes(p));
  return valid.length > 0 ? valid : undefined;
}

export function parseFilters(
  raw: Record<string, RawValue>
): FilterState {
  const sortRaw = pickString(raw.sortBy);
  const sortBy: SortKey =
    sortRaw && (SORT_KEYS as string[]).includes(sortRaw)
      ? (sortRaw as SortKey)
      : DEFAULT_SORT;
  const pageRaw = pickNumber(raw.page);
  const page = pageRaw && pageRaw >= 1 ? Math.floor(pageRaw) : 1;

  const categoryRaw = pickString(raw.category);
  const category =
    categoryRaw && (CATEGORY_KEYS as string[]).includes(categoryRaw)
      ? (categoryRaw as VehicleCategory)
      : undefined;

  return {
    q: pickString(raw.q),
    category,
    brand: pickString(raw.brand),
    model: pickString(raw.model),
    countries: pickList(raw.country, COUNTRY_CODES),
    fuels: pickList<FuelKey>(raw.fuel, FUEL_KEYS),
    transmissions: pickList<TransmissionKey>(raw.transmission, TRANSMISSION_KEYS),
    bodyTypes: pickList<BodyTypeKey>(raw.body, BODY_KEYS),
    yearFrom: pickNumber(raw.yearFrom),
    yearTo: pickNumber(raw.yearTo),
    priceFrom: pickNumber(raw.priceFrom),
    priceTo: pickNumber(raw.priceTo),
    mileageFrom: pickNumber(raw.mileageFrom),
    mileageTo: pickNumber(raw.mileageTo),
    sortBy,
    page,
  };
}

// === Application ===

export function applyFilters(listings: Listing[], f: FilterState): Listing[] {
  const qTokens = f.q
    ? f.q
        .toLowerCase()
        .split(/\s+/)
        .map((t) => t.trim())
        .filter(Boolean)
    : null;

  return listings.filter((l) => {
    if (qTokens) {
      const haystack = `${l.brand} ${l.model}`.toLowerCase();
      if (!qTokens.every((tok) => haystack.includes(tok))) return false;
    }
    if (f.brand && l.brand !== f.brand) return false;
    if (f.model && !listingMatchesModel(l.model, f.model)) return false;
    if (f.countries && f.countries.length > 0 && !f.countries.includes(l.country))
      return false;
    // Vehicle-only filters: a listing without the attribute (e.g. parts) is
    // excluded whenever such a filter is active.
    if (f.fuels && f.fuels.length > 0 && (!l.fuel || !f.fuels.includes(l.fuel)))
      return false;
    if (
      f.transmissions &&
      f.transmissions.length > 0 &&
      (!l.transmission || !f.transmissions.includes(l.transmission))
    )
      return false;
    if (
      f.bodyTypes &&
      f.bodyTypes.length > 0 &&
      !f.bodyTypes.includes(l.details.bodyType)
    )
      return false;
    if (f.yearFrom !== undefined && (l.year === undefined || l.year < f.yearFrom))
      return false;
    if (f.yearTo !== undefined && (l.year === undefined || l.year > f.yearTo))
      return false;
    if (f.priceFrom !== undefined && l.priceEur < f.priceFrom) return false;
    if (f.priceTo !== undefined && l.priceEur > f.priceTo) return false;
    if (
      f.mileageFrom !== undefined &&
      (l.mileageKm === undefined || l.mileageKm < f.mileageFrom)
    )
      return false;
    if (
      f.mileageTo !== undefined &&
      (l.mileageKm === undefined || l.mileageKm > f.mileageTo)
    )
      return false;
    return true;
  });
}

export function applySort(listings: Listing[], sort: SortKey): Listing[] {
  const arr = [...listings];
  switch (sort) {
    case "premium":
      arr.sort((a, b) => {
        if (a.premium !== b.premium) return a.premium ? -1 : 1;
        return a.daysSincePosted - b.daysSincePosted;
      });
      break;
    case "newest":
      arr.sort((a, b) => a.daysSincePosted - b.daysSincePosted);
      break;
    case "priceAsc":
      arr.sort((a, b) => a.priceEur - b.priceEur);
      break;
    case "priceDesc":
      arr.sort((a, b) => b.priceEur - a.priceEur);
      break;
    case "mileage":
      arr.sort((a, b) => (a.mileageKm ?? 0) - (b.mileageKm ?? 0));
      break;
  }
  return arr;
}

// === Serialization ===

export function buildSearchString(f: Partial<FilterState>): string {
  const sp = new URLSearchParams();
  if (f.q) sp.set("q", f.q);
  if (f.category) sp.set("category", f.category);
  if (f.brand) sp.set("brand", f.brand);
  if (f.model) sp.set("model", f.model);
  if (f.countries && f.countries.length > 0) sp.set("country", f.countries.join(","));
  if (f.fuels && f.fuels.length > 0) sp.set("fuel", f.fuels.join(","));
  if (f.transmissions && f.transmissions.length > 0)
    sp.set("transmission", f.transmissions.join(","));
  if (f.bodyTypes && f.bodyTypes.length > 0)
    sp.set("body", f.bodyTypes.join(","));
  if (f.yearFrom !== undefined) sp.set("yearFrom", String(f.yearFrom));
  if (f.yearTo !== undefined) sp.set("yearTo", String(f.yearTo));
  if (f.priceFrom !== undefined) sp.set("priceFrom", String(f.priceFrom));
  if (f.priceTo !== undefined) sp.set("priceTo", String(f.priceTo));
  if (f.mileageFrom !== undefined) sp.set("mileageFrom", String(f.mileageFrom));
  if (f.mileageTo !== undefined) sp.set("mileageTo", String(f.mileageTo));
  if (f.sortBy && f.sortBy !== DEFAULT_SORT) sp.set("sortBy", f.sortBy);
  if (f.page && f.page > 1) sp.set("page", String(f.page));
  const s = sp.toString();
  return s ? `?${s}` : "";
}

// === Active filter count (for sidebar badge) ===

export function countActiveFilters(f: FilterState): number {
  let n = 0;
  if (f.q) n++;
  if (f.brand) n++;
  if (f.model) n++;
  if (f.countries && f.countries.length > 0) n++;
  if (f.fuels && f.fuels.length > 0) n++;
  if (f.transmissions && f.transmissions.length > 0) n++;
  if (f.bodyTypes && f.bodyTypes.length > 0) n++;
  if (f.yearFrom !== undefined || f.yearTo !== undefined) n++;
  if (f.priceFrom !== undefined || f.priceTo !== undefined) n++;
  if (f.mileageFrom !== undefined || f.mileageTo !== undefined) n++;
  return n;
}
