/**
 * Local draft persistence for the "Подать объявление" form.
 *
 * Why: an unauthenticated visitor who starts filling /new and goes to log in
 * (or reloads) used to come back to an empty form — the most discouraging
 * way to lose progress. We mirror the text fields to localStorage on every
 * change and restore them on mount.
 *
 * Photos are NOT persisted (File objects don't serialize); they're re-picked.
 *
 * Clearing: we never clear on submit directly (a server-side bounce —
 * moderation / rate-limit — would then wipe a valid draft). Instead we set a
 * per-tab "submitted" flag and clear the draft only once the user lands back
 * on /new with no error, i.e. the previous submit actually succeeded.
 */

"use client";

const DRAFT_KEY = "ad_new_draft";
const SUBMIT_FLAG = "ad_new_submitted";

export type DraftFields = Record<string, string>;

export function loadDraft(): DraftFields | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as DraftFields) : null;
  } catch {
    return null;
  }
}

export function saveDraft(fields: DraftFields): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(fields));
  } catch {
    // storage full / blocked — drafting is best-effort
  }
}

export function clearDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

/** Mark that a publish attempt was just fired (called from the submit handler). */
export function markSubmitted(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(SUBMIT_FLAG, "1");
  } catch {
    /* ignore */
  }
}

/** Read-and-clear the "submitted" flag. True if a submit happened earlier this tab session. */
export function consumeSubmittedFlag(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.sessionStorage.getItem(SUBMIT_FLAG) === "1") {
      window.sessionStorage.removeItem(SUBMIT_FLAG);
      return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}
