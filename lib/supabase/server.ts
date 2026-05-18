/**
 * Server-side Supabase client — reads + writes cookies via next/headers.
 * Use from Server Components, Route Handlers, and Server Actions.
 *
 * IMPORTANT: instantiate per request (no module-level singleton). Each
 * request has its own cookies → its own auth.uid() under RLS.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Components cannot set cookies — silently ignored.
            // Session refresh happens in middleware (proxy.ts) so this is fine.
          }
        },
      },
    }
  );
}
