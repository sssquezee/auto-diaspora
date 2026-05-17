/**
 * Client-side favorites stored in localStorage.
 * Key shape: { key: "ad:favorites", value: '["1","5","23"]' }
 */

export const FAVORITES_KEY = "ad:favorites";
export const FAVORITES_CHANGED_EVENT = "ad:favorites:changed";

function readFromStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function writeToStorage(ids: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
  // Notify same-tab listeners (storage event only fires on OTHER tabs)
  window.dispatchEvent(new CustomEvent(FAVORITES_CHANGED_EVENT));
}

export function getFavorites(): string[] {
  return readFromStorage();
}

export function isFavorite(id: string): boolean {
  return readFromStorage().includes(id);
}

export function toggleFavorite(id: string): string[] {
  const current = readFromStorage();
  const next = current.includes(id)
    ? current.filter((x) => x !== id)
    : [...current, id];
  writeToStorage(next);
  return next;
}

export function addFavorite(id: string): string[] {
  const current = readFromStorage();
  if (current.includes(id)) return current;
  const next = [...current, id];
  writeToStorage(next);
  return next;
}

export function removeFavorite(id: string): string[] {
  const current = readFromStorage();
  const next = current.filter((x) => x !== id);
  writeToStorage(next);
  return next;
}
