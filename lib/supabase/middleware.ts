/**
 * Middleware Supabase client — refreshes the auth session cookie on
 * every request. Must run inside the project's edge middleware (proxy.ts)
 * BEFORE any auth-gated logic, otherwise Server Components see a stale
 * session.
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(
  request: NextRequest,
  response: NextResponse
): Promise<NextResponse> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Trigger refresh-if-needed. Per Supabase docs this MUST be called
  // between createServerClient() and returning the response, otherwise
  // expired sessions don't get rotated.
  await supabase.auth.getUser();

  return response;
}
