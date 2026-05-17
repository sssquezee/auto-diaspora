/**
 * Client-side saved searches stored in localStorage.
 *
 * Each entry stores the URL query string for /search (so we can restore
 * filters exactly by appending it as `${href}${query}`) and a name set
 * by the user.
 *
 * Once Supabase is wired, swap this for a `saved_searches` table — but
 * keep the same shape so the UI components don't need to change.
 */

export const SAVED_SEARCHES_KEY = "ad:saved-searches";
export const SAVED_SEARCHES_CHANGED_EVENT = "ad:saved-searches:changed";

export type SavedSearch = {
  id: string;
  name: string;
  /** URL query string including leading "?" (or empty for "all listings"). */
  query: string;
  /** Human-readable summary of active filters, computed at save time. */
  summary: string;
  /** ISO timestamp. */
  createdAt: string;
};

function isSavedSearch(value: unknown): value is SavedSearch {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.name === "string" &&
    typeof v.query === "string" &&
    typeof v.summary === "string" &&
    typeof v.createdAt === "string"
  );
}

function readFromStorage(): SavedSearch[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SAVED_SEARCHES_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isSavedSearch);
  } catch {
    return [];
  }
}

function writeToStorage(items: SavedSearch[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(SAVED_SEARCHES_CHANGED_EVENT));
}

export function getSavedSearches(): SavedSearch[] {
  return readFromStorage();
}

export function addSavedSearch(input: {
  name: string;
  query: string;
  summary: string;
}): SavedSearch[] {
  const item: SavedSearch = {
    id: `ss-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: input.name.trim() || "Untitled",
    query: input.query,
    summary: input.summary,
    createdAt: new Date().toISOString(),
  };
  const next = [item, ...readFromStorage()];
  writeToStorage(next);
  return next;
}

export function removeSavedSearch(id: string): SavedSearch[] {
  const next = readFromStorage().filter((s) => s.id !== id);
  writeToStorage(next);
  return next;
}

export function hasSavedSearchWithQuery(query: string): boolean {
  return readFromStorage().some((s) => s.query === query);
}
