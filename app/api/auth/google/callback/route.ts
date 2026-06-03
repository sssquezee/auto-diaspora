/**
 * Google OAuth — step 2: the callback.
 *
 * Google redirects the browser here with `?code=...&state=...`. We:
 *   1. Verify `state` against the httpOnly nonce cookie (CSRF) and recover
 *      the locale packed into it.
 *   2. Exchange the code for tokens at Google's token endpoint using our
 *      client_id + client_secret (server-to-server, over TLS).
 *   3. Decode the id_token to get the user's verified email + profile. We
 *      trust it without re-verifying the signature because it came straight
 *      from Google's token endpoint, not from the browser.
 *   4. Find-or-create a Supabase user keyed by email, refresh their profile,
 *      then establish a session via a one-time random password (same trick
 *      as the Telegram login route).
 *   5. Redirect to /{locale}/account.
 *
 * Requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.
 */

import { NextResponse, type NextRequest } from "next/server";
import crypto from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { routing } from "@/i18n/routing";

const STATE_COOKIE = "g_oauth_state";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

type GoogleIdToken = {
  sub: string;
  email?: string;
  email_verified?: boolean | string;
  name?: string;
  picture?: string;
};

function decodeIdToken(token: string): GoogleIdToken | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const json = Buffer.from(parts[1], "base64url").toString("utf8");
    return JSON.parse(json) as GoogleIdToken;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || url.origin;

  // Recover locale from state (set in the initiate route); fall back safely.
  const state = url.searchParams.get("state") ?? "";
  const [stateNonce, stateLocaleRaw] = state.split(".");
  const locale = (routing.locales as readonly string[]).includes(
    stateLocaleRaw
  )
    ? stateLocaleRaw
    : routing.defaultLocale;

  const redirectTo = (path: string) =>
    NextResponse.redirect(`${origin}${path}`);
  const fail = () => {
    const res = redirectTo(`/${locale}/auth/login?error=google`);
    res.cookies.delete(STATE_COOKIE);
    return res;
  };

  // User denied consent, or Google returned an error.
  if (url.searchParams.get("error")) return fail();

  const code = url.searchParams.get("code");
  if (!code) return fail();

  // CSRF: the nonce echoed in `state` must match the httpOnly cookie.
  const cookieNonce = request.cookies.get(STATE_COOKIE)?.value;
  if (!cookieNonce || !stateNonce || cookieNonce !== stateNonce) return fail();

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return fail();

  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ?? `${origin}/api/auth/google/callback`;

  // 1. Exchange the authorization code for tokens.
  let idToken: string | undefined;
  try {
    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    if (!tokenRes.ok) return fail();
    const tokenJson = (await tokenRes.json()) as { id_token?: string };
    idToken = tokenJson.id_token;
  } catch {
    return fail();
  }
  if (!idToken) return fail();

  // 2. Decode identity from the id_token.
  const claims = decodeIdToken(idToken);
  const email = claims?.email?.toLowerCase().trim();
  const emailVerified =
    claims?.email_verified === true || claims?.email_verified === "true";
  if (!email || !emailVerified) return fail();

  const fullName = claims?.name?.trim() || null;
  const avatarUrl = claims?.picture?.trim() || null;

  const admin = createAdminClient();

  // 3. Find existing user by email, else create one.
  const { data: existing } = await admin
    .from("profiles")
    .select("id,email")
    .eq("email", email)
    .limit(1)
    .maybeSingle<{ id: string; email: string }>();

  let userId: string;

  if (existing) {
    userId = existing.id;
    // Refresh Google-supplied display fields without clobbering existing
    // values with nulls.
    const patch: Record<string, string> = {};
    if (fullName) patch.full_name = fullName;
    if (avatarUrl) patch.avatar_url = avatarUrl;
    if (Object.keys(patch).length > 0) {
      await admin.from("profiles").update(patch).eq("id", userId);
    }
  } else {
    const { data: created, error: createErr } =
      await admin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          provider: "google",
          language: locale,
          full_name: fullName ?? undefined,
          avatar_url: avatarUrl ?? undefined,
        },
      });
    if (createErr || !created.user) return fail();
    userId = created.user.id;
    // handle_new_user already inserted the profile row; fill display fields.
    const patch: Record<string, string> = {};
    if (fullName) patch.full_name = fullName;
    if (avatarUrl) patch.avatar_url = avatarUrl;
    if (Object.keys(patch).length > 0) {
      await admin.from("profiles").update(patch).eq("id", userId);
    }
  }

  // 4. Establish a session via a one-time random password.
  const password = `${crypto.randomUUID()}${crypto.randomUUID()}`;
  const { error: pwErr } = await admin.auth.admin.updateUserById(userId, {
    password,
  });
  if (pwErr) return fail();

  const supabase = await createClient();
  const { error: signErr } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (signErr) return fail();

  const res = redirectTo(`/${locale}/account`);
  res.cookies.delete(STATE_COOKIE);
  return res;
}
