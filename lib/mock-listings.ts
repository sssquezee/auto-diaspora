/**
 * Mock listings used until Supabase is wired up.
 * Reference: auto-diaspora-mono.html section "CARDS". Generated via
 * makeListing() helper from compact seeds so the data block stays scannable.
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
  daysSincePosted: number;
  badges: ListingBadge[];
  premium: boolean;
  details: ListingDetail;
};

// =========== Lookup tables (translated values for seeds) ===========

const CITIES: Record<string, LocalizedString> = {
  munich: { uk: "Мюнхен", ru: "Мюнхен", en: "Munich" },
  berlin: { uk: "Берлін", ru: "Берлин", en: "Berlin" },
  hamburg: { uk: "Гамбург", ru: "Гамбург", en: "Hamburg" },
  frankfurt: { uk: "Франкфурт", ru: "Франкфурт", en: "Frankfurt" },
  cologne: { uk: "Кельн", ru: "Кёльн", en: "Cologne" },
  warsaw: { uk: "Варшава", ru: "Варшава", en: "Warsaw" },
  krakow: { uk: "Краків", ru: "Краков", en: "Krakow" },
  wroclaw: { uk: "Вроцлав", ru: "Вроцлав", en: "Wrocław" },
  poznan: { uk: "Познань", ru: "Познань", en: "Poznań" },
  amsterdam: { uk: "Амстердам", ru: "Амстердам", en: "Amsterdam" },
  rotterdam: { uk: "Роттердам", ru: "Роттердам", en: "Rotterdam" },
  utrecht: { uk: "Утрехт", ru: "Утрехт", en: "Utrecht" },
  prague: { uk: "Прага", ru: "Прага", en: "Prague" },
  brno: { uk: "Брно", ru: "Брно", en: "Brno" },
  antwerp: { uk: "Антверпен", ru: "Антверпен", en: "Antwerp" },
  brussels: { uk: "Брюссель", ru: "Брюссель", en: "Brussels" },
};

const COLORS: Record<string, LocalizedString> = {
  black: { uk: "Чорний", ru: "Чёрный", en: "Black" },
  white: { uk: "Білий", ru: "Белый", en: "White" },
  silver: { uk: "Сріблястий", ru: "Серебристый", en: "Silver" },
  grey: { uk: "Сірий", ru: "Серый", en: "Grey" },
  darkBlue: { uk: "Темно-синій", ru: "Тёмно-синий", en: "Dark blue" },
  red: { uk: "Червоний", ru: "Красный", en: "Red" },
  green: { uk: "Зелений", ru: "Зелёный", en: "Green" },
  beige: { uk: "Бежевий", ru: "Бежевый", en: "Beige" },
  brown: { uk: "Коричневий", ru: "Коричневый", en: "Brown" },
};

const SELLERS: Record<string, Seller> = {
  hansM: { name: "Hans M.", memberSinceYear: 2024, listingsCount: 12, verified: true },
  klausW: { name: "Klaus W.", memberSinceYear: 2024, listingsCount: 5, verified: true },
  frankB: { name: "Frank B.", memberSinceYear: 2025, listingsCount: 3, verified: false },
  marcinW: { name: "Marcin W.", memberSinceYear: 2025, listingsCount: 4, verified: false },
  annaK: { name: "Anna K.", memberSinceYear: 2024, listingsCount: 7, verified: true },
  pieterV: { name: "Pieter V.", memberSinceYear: 2025, listingsCount: 1, verified: true },
  tomasH: { name: "Tomáš H.", memberSinceYear: 2025, listingsCount: 2, verified: true },
  olexandrK: { name: "Олександр К.", memberSinceYear: 2024, listingsCount: 8, verified: true },
  andriyB: { name: "Андрій Б.", memberSinceYear: 2024, listingsCount: 6, verified: true },
  sergiyM: { name: "Сергій М.", memberSinceYear: 2025, listingsCount: 3, verified: false },
};

const COMMON_DESCRIPTION: LocalizedString = {
  uk: "Машина в чудовому стані. Один власник, повна сервісна історія в офіційного дилера. Без ДТП, без перефарбувань. Усі рідини змінено за регламентом. Готова до перереєстрації в ЄС або вивезення в Україну. Документи в порядку, технічний огляд на 12 місяців.",
  ru: "Машина в отличном состоянии. Один владелец, полная сервисная история у официального дилера. Без ДТП, без перекраса. Все жидкости заменены по регламенту. Готова к перерегистрации в ЕС или вывозу в Украину. Документы в порядке, техосмотр на 12 месяцев.",
  en: "Excellent condition. One owner, full official-dealer service history. No accidents, no repainting. All fluids changed per schedule. Ready for EU re-registration or export to Ukraine. Papers in order, technical inspection valid for 12 months.",
};

function postedAtFor(daysAgo: number): LocalizedString {
  if (daysAgo === 0) return { uk: "сьогодні", ru: "сегодня", en: "today" };
  if (daysAgo === 1) return { uk: "вчора", ru: "вчера", en: "yesterday" };
  if (daysAgo < 7)
    return {
      uk: `${daysAgo} дні`,
      ru: `${daysAgo} дн.`,
      en: `${daysAgo}d`,
    };
  const weeks = Math.floor(daysAgo / 7);
  return {
    uk: `${weeks} тиж.`,
    ru: `${weeks} нед.`,
    en: `${weeks}w`,
  };
}

function priceUahFromEur(eur: number): string {
  const uah = eur * 45; // approx rate
  if (uah >= 1_000_000) return `₴${(uah / 1_000_000).toFixed(2).replace(/\.?0+$/, "")}M`;
  return `₴${Math.round(uah / 1000)}K`;
}

// =========== Compact seed type + builder ===========

type ListingSeed = {
  id: string;
  brand: string;
  model: string;
  year: number;
  mileageKm: number;
  engineSpecLatin: string;
  priceEur: number;
  fuel: FuelKey;
  transmission: TransmissionKey;
  country: string;
  city: keyof typeof CITIES;
  photoCount: number;
  imageVariant: 1 | 2 | 3 | 4 | 5 | 6;
  daysAgo: number;
  badges?: ListingBadge[];
  premium?: boolean;
  bodyType: BodyTypeKey;
  driveType: DriveTypeKey;
  powerHp: number;
  engineVolumeL?: number;
  color: keyof typeof COLORS;
  customsCleared?: boolean;
  views: number;
  favorites: number;
  seller: keyof typeof SELLERS;
};

function engineSpecFor(seed: ListingSeed): LocalizedString {
  if (seed.fuel === "electric")
    return { uk: "Електро", ru: "Электро", en: "Electric" };
  return { uk: seed.engineSpecLatin, ru: seed.engineSpecLatin, en: seed.engineSpecLatin };
}

function makeListing(seed: ListingSeed): Listing {
  return {
    id: seed.id,
    brand: seed.brand,
    model: seed.model,
    year: seed.year,
    mileageKm: seed.mileageKm,
    engineSpec: engineSpecFor(seed),
    priceEur: seed.priceEur,
    priceUah: priceUahFromEur(seed.priceEur),
    fuel: seed.fuel,
    transmission: seed.transmission,
    country: seed.country,
    city: CITIES[seed.city],
    photoCount: seed.photoCount,
    imageVariant: seed.imageVariant,
    postedAt: postedAtFor(seed.daysAgo),
    daysSincePosted: seed.daysAgo,
    badges: seed.badges ?? [],
    premium: seed.premium ?? false,
    details: {
      bodyType: seed.bodyType,
      driveType: seed.driveType,
      powerHp: seed.powerHp,
      engineVolumeL: seed.engineVolumeL,
      color: COLORS[seed.color],
      customsCleared: seed.customsCleared ?? false,
      description: COMMON_DESCRIPTION,
      views: seed.views,
      favorites: seed.favorites,
      seller: SELLERS[seed.seller],
    },
  };
}

// =========== 30 listings ===========

const SEEDS: ListingSeed[] = [
  // The original 6 from auto-diaspora-mono.html
  { id: "1", brand: "BMW", model: "X5 xDrive30d", year: 2020, mileageKm: 87000, engineSpecLatin: "3.0 TDI", priceEur: 38900, fuel: "diesel", transmission: "auto", country: "DE", city: "munich", photoCount: 18, imageVariant: 1, daysAgo: 0, badges: ["verified"], premium: true, bodyType: "suv", driveType: "awd", powerHp: 265, engineVolumeL: 3.0, color: "black", customsCleared: false, views: 1247, favorites: 89, seller: "hansM" },
  { id: "2", brand: "VW", model: "Passat B8 Variant", year: 2018, mileageKm: 142000, engineSpecLatin: "2.0 TDI", priceEur: 14500, fuel: "diesel", transmission: "auto", country: "PL", city: "warsaw", photoCount: 12, imageVariant: 2, daysAgo: 0, badges: ["top", "urgent"], bodyType: "wagon", driveType: "fwd", powerHp: 150, engineVolumeL: 2.0, color: "silver", customsCleared: true, views: 642, favorites: 31, seller: "marcinW" },
  { id: "3", brand: "Škoda", model: "Octavia A7", year: 2019, mileageKm: 98500, engineSpecLatin: "1.6 TDI", priceEur: 11200, fuel: "diesel", transmission: "manual", country: "CZ", city: "prague", photoCount: 9, imageVariant: 3, daysAgo: 0, badges: ["new", "verified"], bodyType: "sedan", driveType: "fwd", powerHp: 115, engineVolumeL: 1.6, color: "white", views: 384, favorites: 22, seller: "tomasH" },
  { id: "4", brand: "Audi", model: "A6 Avant Quattro", year: 2017, mileageKm: 178000, engineSpecLatin: "3.0 TDI", priceEur: 19800, fuel: "diesel", transmission: "auto", country: "DE", city: "berlin", photoCount: 24, imageVariant: 4, daysAgo: 1, badges: ["top"], bodyType: "wagon", driveType: "awd", powerHp: 218, engineVolumeL: 3.0, color: "grey", customsCleared: true, views: 892, favorites: 47, seller: "olexandrK" },
  { id: "5", brand: "Tesla", model: "Model 3 LR", year: 2022, mileageKm: 42000, engineSpecLatin: "Electric", priceEur: 28500, fuel: "electric", transmission: "auto", country: "NL", city: "amsterdam", photoCount: 15, imageVariant: 5, daysAgo: 2, premium: true, bodyType: "sedan", driveType: "awd", powerHp: 366, color: "red", views: 1583, favorites: 124, seller: "pieterV" },
  { id: "6", brand: "Mercedes", model: "E220d W213", year: 2019, mileageKm: 124000, engineSpecLatin: "2.0 TDI", priceEur: 24300, fuel: "diesel", transmission: "auto", country: "BE", city: "antwerp", photoCount: 11, imageVariant: 6, daysAgo: 3, badges: ["verified"], bodyType: "sedan", driveType: "rwd", powerHp: 194, engineVolumeL: 2.0, color: "darkBlue", customsCleared: true, views: 521, favorites: 28, seller: "andriyB" },

  // BMW expansion
  { id: "7", brand: "BMW", model: "320d F30", year: 2017, mileageKm: 167000, engineSpecLatin: "2.0 TDI", priceEur: 12800, fuel: "diesel", transmission: "auto", country: "DE", city: "hamburg", photoCount: 14, imageVariant: 2, daysAgo: 1, badges: ["verified"], bodyType: "sedan", driveType: "rwd", powerHp: 190, engineVolumeL: 2.0, color: "white", customsCleared: true, views: 412, favorites: 18, seller: "klausW" },
  { id: "8", brand: "BMW", model: "530d G30", year: 2019, mileageKm: 95000, engineSpecLatin: "3.0 TDI", priceEur: 32500, fuel: "diesel", transmission: "auto", country: "DE", city: "frankfurt", photoCount: 22, imageVariant: 1, daysAgo: 4, badges: ["top"], premium: true, bodyType: "sedan", driveType: "rwd", powerHp: 265, engineVolumeL: 3.0, color: "black", views: 1102, favorites: 67, seller: "hansM" },
  { id: "9", brand: "BMW", model: "X3 xDrive20d", year: 2018, mileageKm: 118000, engineSpecLatin: "2.0 TDI", priceEur: 21900, fuel: "diesel", transmission: "auto", country: "PL", city: "krakow", photoCount: 16, imageVariant: 4, daysAgo: 5, badges: ["verified"], bodyType: "suv", driveType: "awd", powerHp: 190, engineVolumeL: 2.0, color: "silver", customsCleared: true, views: 723, favorites: 35, seller: "annaK" },

  // Audi expansion
  { id: "10", brand: "Audi", model: "A4 B9 Avant", year: 2019, mileageKm: 102000, engineSpecLatin: "2.0 TDI", priceEur: 17800, fuel: "diesel", transmission: "auto", country: "DE", city: "cologne", photoCount: 13, imageVariant: 3, daysAgo: 2, badges: ["verified"], bodyType: "wagon", driveType: "fwd", powerHp: 150, engineVolumeL: 2.0, color: "grey", views: 487, favorites: 24, seller: "frankB" },
  { id: "11", brand: "Audi", model: "Q5 quattro", year: 2020, mileageKm: 76000, engineSpecLatin: "2.0 TDI", priceEur: 32100, fuel: "diesel", transmission: "auto", country: "NL", city: "rotterdam", photoCount: 19, imageVariant: 5, daysAgo: 6, premium: true, bodyType: "suv", driveType: "awd", powerHp: 190, engineVolumeL: 2.0, color: "black", views: 912, favorites: 54, seller: "pieterV" },
  { id: "12", brand: "Audi", model: "A3 Sportback", year: 2017, mileageKm: 134000, engineSpecLatin: "1.6 TDI", priceEur: 10400, fuel: "diesel", transmission: "manual", country: "PL", city: "wroclaw", photoCount: 10, imageVariant: 6, daysAgo: 1, badges: ["new"], bodyType: "hatchback", driveType: "fwd", powerHp: 110, engineVolumeL: 1.6, color: "red", customsCleared: true, views: 298, favorites: 14, seller: "sergiyM" },

  // Mercedes expansion
  { id: "13", brand: "Mercedes", model: "C220d W205", year: 2018, mileageKm: 137000, engineSpecLatin: "2.0 TDI", priceEur: 17600, fuel: "diesel", transmission: "auto", country: "DE", city: "berlin", photoCount: 17, imageVariant: 1, daysAgo: 8, badges: ["verified"], bodyType: "sedan", driveType: "rwd", powerHp: 194, engineVolumeL: 2.0, color: "silver", views: 583, favorites: 29, seller: "hansM" },
  { id: "14", brand: "Mercedes", model: "GLC 220d", year: 2019, mileageKm: 88000, engineSpecLatin: "2.0 TDI", priceEur: 29900, fuel: "diesel", transmission: "auto", country: "BE", city: "brussels", photoCount: 21, imageVariant: 2, daysAgo: 3, badges: ["top"], premium: true, bodyType: "suv", driveType: "awd", powerHp: 194, engineVolumeL: 2.0, color: "darkBlue", customsCleared: true, views: 1042, favorites: 71, seller: "andriyB" },

  // VW + Škoda
  { id: "15", brand: "VW", model: "Tiguan", year: 2018, mileageKm: 121000, engineSpecLatin: "2.0 TDI", priceEur: 18900, fuel: "diesel", transmission: "auto", country: "CZ", city: "brno", photoCount: 15, imageVariant: 3, daysAgo: 5, bodyType: "suv", driveType: "awd", powerHp: 150, engineVolumeL: 2.0, color: "white", customsCleared: true, views: 612, favorites: 33, seller: "tomasH" },
  { id: "16", brand: "VW", model: "Golf VII GTI", year: 2017, mileageKm: 109000, engineSpecLatin: "2.0 TSI", priceEur: 15200, fuel: "petrol", transmission: "manual", country: "DE", city: "hamburg", photoCount: 12, imageVariant: 4, daysAgo: 2, badges: ["new", "urgent"], bodyType: "hatchback", driveType: "fwd", powerHp: 230, engineVolumeL: 2.0, color: "red", views: 871, favorites: 52, seller: "klausW" },
  { id: "17", brand: "Škoda", model: "Superb III", year: 2019, mileageKm: 96000, engineSpecLatin: "2.0 TDI", priceEur: 15800, fuel: "diesel", transmission: "auto", country: "PL", city: "poznan", photoCount: 14, imageVariant: 5, daysAgo: 4, badges: ["verified"], bodyType: "sedan", driveType: "fwd", powerHp: 150, engineVolumeL: 2.0, color: "grey", customsCleared: true, views: 491, favorites: 26, seller: "marcinW" },
  { id: "18", brand: "Škoda", model: "Kodiaq", year: 2020, mileageKm: 78000, engineSpecLatin: "2.0 TDI", priceEur: 26500, fuel: "diesel", transmission: "auto", country: "CZ", city: "prague", photoCount: 18, imageVariant: 6, daysAgo: 9, badges: ["top"], bodyType: "suv", driveType: "awd", powerHp: 190, engineVolumeL: 2.0, color: "white", views: 743, favorites: 41, seller: "tomasH" },

  // French + Tesla + Honda
  { id: "19", brand: "Renault", model: "Megane IV", year: 2018, mileageKm: 128000, engineSpecLatin: "1.5 dCi", priceEur: 8900, fuel: "diesel", transmission: "manual", country: "PL", city: "warsaw", photoCount: 9, imageVariant: 1, daysAgo: 1, badges: ["new"], bodyType: "hatchback", driveType: "fwd", powerHp: 110, engineVolumeL: 1.5, color: "darkBlue", customsCleared: true, views: 234, favorites: 11, seller: "annaK" },
  { id: "20", brand: "Renault", model: "Captur II", year: 2021, mileageKm: 38000, engineSpecLatin: "1.3 TCe", priceEur: 16400, fuel: "petrol", transmission: "auto", country: "BE", city: "antwerp", photoCount: 11, imageVariant: 2, daysAgo: 6, bodyType: "suv", driveType: "fwd", powerHp: 130, engineVolumeL: 1.3, color: "red", views: 408, favorites: 19, seller: "andriyB" },
  { id: "21", brand: "Peugeot", model: "308 II", year: 2017, mileageKm: 145000, engineSpecLatin: "1.6 BlueHDi", priceEur: 8200, fuel: "diesel", transmission: "manual", country: "NL", city: "utrecht", photoCount: 8, imageVariant: 3, daysAgo: 0, badges: ["urgent"], bodyType: "hatchback", driveType: "fwd", powerHp: 120, engineVolumeL: 1.6, color: "white", customsCleared: true, views: 187, favorites: 8, seller: "pieterV" },
  { id: "22", brand: "Peugeot", model: "3008 II", year: 2019, mileageKm: 87000, engineSpecLatin: "1.5 BlueHDi", priceEur: 18400, fuel: "diesel", transmission: "auto", country: "DE", city: "frankfurt", photoCount: 13, imageVariant: 4, daysAgo: 3, badges: ["verified"], bodyType: "suv", driveType: "fwd", powerHp: 130, engineVolumeL: 1.5, color: "grey", views: 462, favorites: 23, seller: "frankB" },

  // Tesla + Toyota + Honda
  { id: "23", brand: "Tesla", model: "Model Y LR", year: 2023, mileageKm: 22000, engineSpecLatin: "Electric", priceEur: 41900, fuel: "electric", transmission: "auto", country: "NL", city: "amsterdam", photoCount: 20, imageVariant: 5, daysAgo: 1, badges: ["new"], premium: true, bodyType: "suv", driveType: "awd", powerHp: 384, color: "white", views: 1834, favorites: 142, seller: "pieterV" },
  { id: "24", brand: "Toyota", model: "Corolla XII", year: 2020, mileageKm: 58000, engineSpecLatin: "1.8 Hybrid", priceEur: 17900, fuel: "hybrid", transmission: "auto", country: "PL", city: "krakow", photoCount: 12, imageVariant: 6, daysAgo: 5, badges: ["verified"], bodyType: "sedan", driveType: "fwd", powerHp: 122, engineVolumeL: 1.8, color: "silver", customsCleared: true, views: 521, favorites: 30, seller: "annaK" },
  { id: "25", brand: "Toyota", model: "RAV4 Hybrid", year: 2021, mileageKm: 67000, engineSpecLatin: "2.5 Hybrid", priceEur: 31500, fuel: "hybrid", transmission: "auto", country: "DE", city: "munich", photoCount: 16, imageVariant: 1, daysAgo: 7, badges: ["top", "verified"], premium: true, bodyType: "suv", driveType: "awd", powerHp: 222, engineVolumeL: 2.5, color: "darkBlue", views: 1267, favorites: 89, seller: "hansM" },

  // Opel + Ford + Volvo + Honda
  { id: "26", brand: "Opel", model: "Astra K", year: 2018, mileageKm: 112000, engineSpecLatin: "1.6 CDTI", priceEur: 7800, fuel: "diesel", transmission: "manual", country: "BE", city: "brussels", photoCount: 9, imageVariant: 2, daysAgo: 2, bodyType: "hatchback", driveType: "fwd", powerHp: 110, engineVolumeL: 1.6, color: "white", customsCleared: true, views: 213, favorites: 9, seller: "andriyB" },
  { id: "27", brand: "Ford", model: "Focus mk4", year: 2019, mileageKm: 89000, engineSpecLatin: "1.5 TDCi", priceEur: 11600, fuel: "diesel", transmission: "manual", country: "PL", city: "wroclaw", photoCount: 11, imageVariant: 3, daysAgo: 10, badges: ["verified"], bodyType: "hatchback", driveType: "fwd", powerHp: 120, engineVolumeL: 1.5, color: "red", views: 318, favorites: 16, seller: "marcinW" },
  { id: "28", brand: "Ford", model: "Mondeo Hybrid", year: 2019, mileageKm: 142000, engineSpecLatin: "2.0 Hybrid", priceEur: 13900, fuel: "hybrid", transmission: "auto", country: "NL", city: "rotterdam", photoCount: 13, imageVariant: 4, daysAgo: 14, bodyType: "sedan", driveType: "fwd", powerHp: 187, engineVolumeL: 2.0, color: "grey", customsCleared: true, views: 376, favorites: 18, seller: "pieterV" },
  { id: "29", brand: "Volvo", model: "XC60", year: 2018, mileageKm: 119000, engineSpecLatin: "2.0 D4", priceEur: 24800, fuel: "diesel", transmission: "auto", country: "DE", city: "berlin", photoCount: 17, imageVariant: 5, daysAgo: 4, badges: ["verified"], bodyType: "suv", driveType: "awd", powerHp: 190, engineVolumeL: 2.0, color: "darkBlue", views: 692, favorites: 38, seller: "olexandrK" },
  { id: "30", brand: "Volvo", model: "V60 Recharge", year: 2022, mileageKm: 31000, engineSpecLatin: "T6 PHEV", priceEur: 36500, fuel: "hybrid", transmission: "auto", country: "NL", city: "amsterdam", photoCount: 19, imageVariant: 6, daysAgo: 11, badges: ["new"], premium: true, bodyType: "wagon", driveType: "awd", powerHp: 340, engineVolumeL: 2.0, color: "black", views: 1421, favorites: 96, seller: "pieterV" },
];

export const MOCK_LISTINGS: Listing[] = SEEDS.map(makeListing);

// =========== Image gradients & formatters ===========

export const IMAGE_GRADIENTS: Record<Listing["imageVariant"], string> = {
  1: "linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)",
  2: "linear-gradient(135deg, #2a2a2a 0%, #5e5e5e 100%)",
  3: "linear-gradient(135deg, #1f1f1f 0%, #525252 100%)",
  4: "linear-gradient(135deg, #0f0f0f 0%, #3a3a3a 100%)",
  5: "linear-gradient(135deg, #2e2e2e 0%, #6a6a6a 100%)",
  6: "linear-gradient(135deg, #181818 0%, #404040 100%)",
};

export function formatMileage(km: number, locale: Locale): string {
  const tag = locale === "uk" ? "uk-UA" : locale === "ru" ? "ru-RU" : "en-US";
  return new Intl.NumberFormat(tag).format(km);
}

export function formatPriceEur(amount: number, locale: Locale): string {
  const tag = locale === "uk" ? "uk-UA" : locale === "ru" ? "ru-RU" : "en-US";
  return `€${new Intl.NumberFormat(tag).format(amount)}`;
}

export function getListingById(id: string): Listing | null {
  return MOCK_LISTINGS.find((l) => l.id === id) ?? null;
}

export function getListingsByIds(ids: string[]): Listing[] {
  return ids
    .map((id) => MOCK_LISTINGS.find((l) => l.id === id))
    .filter((l): l is Listing => l !== undefined);
}

export const PAGE_SIZE = 12;
