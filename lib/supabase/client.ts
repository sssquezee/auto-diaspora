/**
 * Browser-side Supabase client.
 * Use this inside `"use client"` components / hooks.
 *
 * For Server Components / Route Handlers / Server Actions use
 * `createClient()` from `./server` instead — it reads cookies via
 * next/headers so RLS can resolve `auth.uid()` correctly.
 */

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
