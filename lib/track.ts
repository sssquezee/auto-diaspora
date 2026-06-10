/**
 * Tiny client-side funnel tracker.
 *
 * Fire-and-forget inserts into `public.funnel_events` via the browser
 * Supabase client (anon key). RLS allows anonymous inserts of the known
 * event names — see supabase/funnel.sql. Never throws and never blocks
 * the UI: analytics must not break the page.
 *
 * `session_id` is a random per-tab id kept in sessionStorage so the events
 * of one visit (view → publish_click → …) can be stitched into a funnel.
 * It is NOT a user id and carries no personal data.
 */

"use client";

import { createClient } from "@/lib/supabase/client";

export type FunnelEvent =
  | "new_view"
  | "new_publish_click"
  | "new_submit_error";

const SESSION_KEY = "ad_funnel_sid";

/**
 * The anonymous per-visit id, exposed so server-side events (created in a
 * Server Action) can be stitched into the same funnel as the client events.
 * Pass it along in the form submission.
 */
export function getFunnelSessionId(): string | null {
  return sessionId();
}

function sessionId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    let id = window.sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    // sessionStorage can throw in private mode / blocked storage — fine.
    return null;
  }
}

export function track(
  event: FunnelEvent,
  opts: { authed?: boolean; locale?: string; meta?: Record<string, unknown> } = {}
): void {
  try {
    const supabase = createClient();
    void supabase
      .from("funnel_events")
      .insert({
        event,
        session_id: sessionId(),
        authed: opts.authed ?? null,
        locale: opts.locale ?? null,
        meta: opts.meta ?? {},
      })
      .then(() => {
        // ignore result — best effort
      });
  } catch {
    // never let analytics break the page
  }
}
