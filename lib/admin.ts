/**
 * Admin gate.
 *
 * Whitelist of user UUIDs in env `ADMIN_USER_IDS` (comma-separated).
 * Keep it short — this is the ops/owner backdoor, not a role system.
 * When the marketplace grows past one-person moderation, swap for a
 * `profiles.is_admin BOOLEAN` column.
 */

import { createClient } from "@/lib/supabase/server";

function getAdminIds(): Set<string> {
  const raw = process.env.ADMIN_USER_IDS ?? "";
  return new Set(
    raw
      .split(",")
      .map((id) => id.trim())
      .filter(
        (id) =>
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
      )
  );
}

/** True when the env var contains any valid UUID. */
export function adminListConfigured(): boolean {
  return getAdminIds().size > 0;
}

/** Resolve the current user, returning their id only if they're whitelisted. */
export async function getAdminUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return getAdminIds().has(user.id) ? user.id : null;
}
