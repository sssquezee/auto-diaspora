/**
 * Brand → base-model dictionary for catalog filters and listing forms.
 *
 * Mock listings store specific trim names like "X5 xDrive30d" or "320d F30".
 * Filtering uses startsWith() against the base model, so picking "X5" matches
 * "X5 xDrive30d", "X5 M50i", etc.
 */

export const BRANDS: string[] = [
  "Audi",
  "BMW",
  "Citroën",
  "Ford",
  "Mercedes",
  "Opel",
  "Peugeot",
  "Renault",
  "Škoda",
  "Tesla",
  "Toyota",
  "VW",
  "Volvo",
];

export const MODELS_BY_BRAND: Record<string, string[]> = {
  Audi: ["A3", "A4", "A5", "A6", "A7", "A8", "Q3", "Q5", "Q7", "Q8", "e-tron"],
  BMW: ["1 Series", "2 Series", "3 Series", "4 Series", "5 Series", "7 Series", "X1", "X3", "X5", "X6", "X7", "i3", "i4", "iX"],
  Citroën: ["C3", "C4", "C5", "Berlingo"],
  Ford: ["Fiesta", "Focus", "Mondeo", "Kuga", "Puma", "Mustang"],
  Mercedes: ["A-Class", "C-Class", "E-Class", "S-Class", "GLA", "GLC", "GLE", "GLS", "EQC"],
  Opel: ["Astra", "Corsa", "Insignia", "Mokka", "Grandland"],
  Peugeot: ["208", "308", "508", "2008", "3008", "5008"],
  Renault: ["Clio", "Megane", "Captur", "Kadjar", "Talisman", "Zoe"],
  Škoda: ["Fabia", "Octavia", "Superb", "Karoq", "Kodiaq", "Enyaq"],
  Tesla: ["Model 3", "Model Y", "Model S", "Model X"],
  Toyota: ["Yaris", "Corolla", "Camry", "RAV4", "C-HR", "Prius"],
  VW: ["Polo", "Golf", "Passat", "Tiguan", "T-Roc", "ID.3", "ID.4"],
  Volvo: ["S60", "S90", "V60", "V90", "XC40", "XC60", "XC90"],
};

export function getModelsForBrand(brand: string | undefined): string[] {
  if (!brand) return [];
  return MODELS_BY_BRAND[brand] ?? [];
}

/** True if listing.model belongs to the picked base model (startsWith match). */
export function listingMatchesModel(listingModel: string, modelFilter: string): boolean {
  return listingModel.toLowerCase().startsWith(modelFilter.toLowerCase());
}
