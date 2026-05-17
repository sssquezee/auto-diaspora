/**
 * Mock listings used until Supabase is wired up.
 * Same 6 cars as in auto-diaspora-mono.html design reference, plus
 * detail-page fields (specs, description, seller) synthesized for stubs.
 */

export type Locale = "uk" | "ru" | "en";
export type LocalizedString = Record<Locale, string>;

export type ListingBadge = "top" | "new" | "urgent" | "verified";
export type FuelKey = "diesel" | "petrol" | "electric" | "hybrid";
export type TransmissionKey = "auto" | "manual";
export type BodyTypeKey = "sedan" | "suv" | "wagon" | "hatchback" | "coupe";
export type DriveTypeKey = "fwd" | "rwd" | "awd";

export type Seller = {
  name: string;
  memberSinceYear: number;
  listingsCount: number;
  verified: boolean;
};

export type ListingDetail = {
  bodyType: BodyTypeKey;
  driveType: DriveTypeKey;
  powerHp: number;
  engineVolumeL?: number;
  color: LocalizedString;
  customsCleared: boolean;
  description: LocalizedString;
  views: number;
  favorites: number;
  seller: Seller;
};

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
  country: string;
  city: LocalizedString;
  photoCount: number;
  imageVariant: 1 | 2 | 3 | 4 | 5 | 6;
  postedAt: LocalizedString;
  badges: ListingBadge[];
  premium: boolean;
  details: ListingDetail;
};

// Shared description placeholder — generic enough to fit any car
const COMMON_DESCRIPTION: LocalizedString = {
  uk: "Машина в чудовому стані. Один власник, повна сервісна історія в офіційного дилера. Без ДТП, без перефарбувань. Усі рідини змінено за регламентом. Готова до перереєстрації в ЄС або вивезення в Україну. Документи в порядку, технічний огляд на 12 місяців. Можливий розгляд обміну з доплатою.",
  ru: "Машина в отличном состоянии. Один владелец, полная сервисная история у официального дилера. Без ДТП, без перекраса. Все жидкости заменены по регламенту. Готова к перерегистрации в ЕС или вывозу в Украину. Документы в порядке, техосмотр на 12 месяцев. Возможен обмен с доплатой.",
  en: "Excellent condition. One owner, full official-dealer service history. No accidents, no repainting. All fluids changed per schedule. Ready for EU re-registration or export to Ukraine. Papers in order, technical inspection valid for 12 months. Trade-in with surcharge possible.",
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
    details: {
      bodyType: "suv",
      driveType: "awd",
      powerHp: 265,
      engineVolumeL: 3.0,
      color: { uk: "Чорний", ru: "Чёрный", en: "Black" },
      customsCleared: false,
      description: COMMON_DESCRIPTION,
      views: 1247,
      favorites: 89,
      seller: { name: "Hans M.", memberSinceYear: 2024, listingsCount: 12, verified: true },
    },
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
    details: {
      bodyType: "wagon",
      driveType: "fwd",
      powerHp: 150,
      engineVolumeL: 2.0,
      color: { uk: "Сріблястий", ru: "Серебристый", en: "Silver" },
      customsCleared: true,
      description: COMMON_DESCRIPTION,
      views: 642,
      favorites: 31,
      seller: { name: "Marcin W.", memberSinceYear: 2025, listingsCount: 4, verified: false },
    },
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
    details: {
      bodyType: "sedan",
      driveType: "fwd",
      powerHp: 115,
      engineVolumeL: 1.6,
      color: { uk: "Білий", ru: "Белый", en: "White" },
      customsCleared: false,
      description: COMMON_DESCRIPTION,
      views: 384,
      favorites: 22,
      seller: { name: "Tomáš H.", memberSinceYear: 2025, listingsCount: 2, verified: true },
    },
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
    details: {
      bodyType: "wagon",
      driveType: "awd",
      powerHp: 218,
      engineVolumeL: 3.0,
      color: { uk: "Сірий", ru: "Серый", en: "Grey" },
      customsCleared: true,
      description: COMMON_DESCRIPTION,
      views: 892,
      favorites: 47,
      seller: { name: "Олександр К.", memberSinceYear: 2024, listingsCount: 8, verified: true },
    },
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
    details: {
      bodyType: "sedan",
      driveType: "awd",
      powerHp: 366,
      color: { uk: "Червоний", ru: "Красный", en: "Red" },
      customsCleared: false,
      description: COMMON_DESCRIPTION,
      views: 1583,
      favorites: 124,
      seller: { name: "Pieter V.", memberSinceYear: 2025, listingsCount: 1, verified: true },
    },
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
    details: {
      bodyType: "sedan",
      driveType: "rwd",
      powerHp: 194,
      engineVolumeL: 2.0,
      color: { uk: "Темно-синій", ru: "Тёмно-синий", en: "Dark blue" },
      customsCleared: true,
      description: COMMON_DESCRIPTION,
      views: 521,
      favorites: 28,
      seller: { name: "Андрій Б.", memberSinceYear: 2024, listingsCount: 6, verified: true },
    },
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

/** Format mileage with locale-aware thousands separator. */
export function formatMileage(km: number, locale: Locale): string {
  const tag = locale === "uk" ? "uk-UA" : locale === "ru" ? "ru-RU" : "en-US";
  return new Intl.NumberFormat(tag).format(km);
}

/** Format price in EUR with locale-aware thousands separator + € symbol. */
export function formatPriceEur(amount: number, locale: Locale): string {
  const tag = locale === "uk" ? "uk-UA" : locale === "ru" ? "ru-RU" : "en-US";
  return `€${new Intl.NumberFormat(tag).format(amount)}`;
}

/** Look up a listing by id, returns null if not found. */
export function getListingById(id: string): Listing | null {
  return MOCK_LISTINGS.find((l) => l.id === id) ?? null;
}
