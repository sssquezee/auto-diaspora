/**
 * Admin Supabase client — bypasses RLS using the service-role key.
 *
 * NEVER expose this client to the browser. Use ONLY from:
 *   - Server Actions
 *   - Route Handlers
 *   - Server-side scripts
 *
 * The new Supabase API key format (`sb_secret_*`) and legacy JWT
 * `service_role` keys are both accepted as the second arg.
 */

import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set — admin operations unavailable."
    );
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
