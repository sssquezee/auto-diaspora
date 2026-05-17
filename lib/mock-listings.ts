/**
 * Mock listings used until Supabase is wired up.
 * Same 6 cars as in auto-diaspora-mono.html design reference.
 */

export type Locale = "uk" | "ru" | "en";
export type LocalizedString = Record<Locale, string>;

export type ListingBadge = "top" | "new" | "urgent" | "verified";
export type FuelKey = "diesel" | "petrol" | "electric" | "hybrid";
export type TransmissionKey = "auto" | "manual";

export type Listing = {
  id: string;
  brand: string;
  model: string;
  year: number;
  mileageKm: number;
  engineSpec: LocalizedString;
  priceEur: number;
  priceUah: string;
  fuel: FuelKey;
  transmission: TransmissionKey;
  country: string; // ISO code: DE, PL, NL, CZ, BE
  city: LocalizedString;
  photoCount: number;
  imageVariant: 1 | 2 | 3 | 4 | 5 | 6;
  postedAt: LocalizedString;
  badges: ListingBadge[];
  premium: boolean;
};

export const MOCK_LISTINGS: Listing[] = [
  {
    id: "1",
    brand: "BMW",
    model: "X5 xDrive30d",
    year: 2020,
    mileageKm: 87000,
    engineSpec: { uk: "3.0 TDI", ru: "3.0 TDI", en: "3.0 TDI" },
    priceEur: 38900,
    priceUah: "₴1.75M",
    fuel: "diesel",
    transmission: "auto",
    country: "DE",
    city: { uk: "Мюнхен", ru: "Мюнхен", en: "Munich" },
    photoCount: 18,
    imageVariant: 1,
    postedAt: { uk: "14:23", ru: "14:23", en: "14:23" },
    badges: ["verified"],
    premium: true,
  },
  {
    id: "2",
    brand: "VW",
    model: "Passat B8 Variant",
    year: 2018,
    mileageKm: 142000,
    engineSpec: { uk: "2.0 TDI", ru: "2.0 TDI", en: "2.0 TDI" },
    priceEur: 14500,
    priceUah: "₴652K",
    fuel: "diesel",
    transmission: "auto",
    country: "PL",
    city: { uk: "Варшава", ru: "Варшава", en: "Warsaw" },
    photoCount: 12,
    imageVariant: 2,
    postedAt: { uk: "2 год", ru: "2 ч", en: "2h" },
    badges: ["top", "urgent"],
    premium: false,
  },
  {
    id: "3",
    brand: "Škoda",
    model: "Octavia A7",
    year: 2019,
    mileageKm: 98500,
    engineSpec: { uk: "1.6 TDI", ru: "1.6 TDI", en: "1.6 TDI" },
    priceEur: 11200,
    priceUah: "₴504K",
    fuel: "diesel",
    transmission: "manual",
    country: "CZ",
    city: { uk: "Прага", ru: "Прага", en: "Prague" },
    photoCount: 9,
    imageVariant: 3,
    postedAt: { uk: "4 год", ru: "4 ч", en: "4h" },
    badges: ["new", "verified"],
    premium: false,
  },
  {
    id: "4",
    brand: "Audi",
    model: "A6 Avant Quattro",
    year: 2017,
    mileageKm: 178000,
    engineSpec: { uk: "3.0 TDI", ru: "3.0 TDI", en: "3.0 TDI" },
    priceEur: 19800,
    priceUah: "₴891K",
    fuel: "diesel",
    transmission: "auto",
    country: "DE",
    city: { uk: "Берлін", ru: "Берлин", en: "Berlin" },
    photoCount: 24,
    imageVariant: 4,
    postedAt: { uk: "вчора", ru: "вчера", en: "yesterday" },
    badges: ["top"],
    premium: false,
  },
  {
    id: "5",
    brand: "Tesla",
    model: "Model 3 LR",
    year: 2022,
    mileageKm: 42000,
    engineSpec: { uk: "Електро", ru: "Электро", en: "Electric" },
    priceEur: 28500,
    priceUah: "₴1.28M",
    fuel: "electric",
    transmission: "auto",
    country: "NL",
    city: { uk: "Амстердам", ru: "Амстердам", en: "Amsterdam" },
    photoCount: 15,
    imageVariant: 5,
    postedAt: { uk: "2 дні", ru: "2 дня", en: "2d" },
    badges: [],
    premium: true,
  },
  {
    id: "6",
    brand: "Mercedes",
    model: "E220d W213",
    year: 2019,
    mileageKm: 124000,
    engineSpec: { uk: "2.0 TDI", ru: "2.0 TDI", en: "2.0 TDI" },
    priceEur: 24300,
    priceUah: "₴1.09M",
    fuel: "diesel",
    transmission: "auto",
    country: "BE",
    city: { uk: "Антверпен", ru: "Антверпен", en: "Antwerp" },
    photoCount: 11,
    imageVariant: 6,
    postedAt: { uk: "3 дні", ru: "3 дня", en: "3d" },
    badges: ["verified"],
    premium: false,
  },
];

export const IMAGE_GRADIENTS: Record<Listing["imageVariant"], string> = {
  1: "linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)",
  2: "linear-gradient(135deg, #2a2a2a 0%, #5e5e5e 100%)",
  3: "linear-gradient(135deg, #1f1f1f 0%, #525252 100%)",
  4: "linear-gradient(135deg, #0f0f0f 0%, #3a3a3a 100%)",
  5: "linear-gradient(135deg, #2e2e2e 0%, #6a6a6a 100%)",
  6: "linear-gradient(135deg, #181818 0%, #404040 100%)",
};

/**
 * Format mileage with locale-aware thousands separator.
 * 87000 (uk) -> "87 000"
 */
export function formatMileage(km: number, locale: Locale): string {
  const localeTag = locale === "uk" ? "uk-UA" : locale === "ru" ? "ru-RU" : "en-US";
  return new Intl.NumberFormat(localeTag).format(km);
}

/**
 * Format price in EUR with locale-aware thousands separator + € symbol.
 * 38900 (uk) -> "€38 900"
 */
export function formatPriceEur(amount: number, locale: Locale): string {
  const localeTag = locale === "uk" ? "uk-UA" : locale === "ru" ? "ru-RU" : "en-US";
  const formatted = new Intl.NumberFormat(localeTag).format(amount);
  return `€${formatted}`;
}
