/**
 * Google OAuth — step 1: kick off the flow.
 *
 * Self-hosted OAuth (NOT Supabase's provider): the browser hits this route,
 * we redirect to Google's consent screen with our own client_id. Google
 * sends the user back to /api/auth/google/callback with a `code`, which the
 * callback route exchanges for the user's identity and then mints a Supabase
 * session (service-role + one-time password, same trick as the Telegram
 * login route).
 *
 * CSRF: we set a random `nonce` in an httpOnly cookie and echo it inside the
 * OAuth `state` param; the callback rejects any mismatch. The active locale
 * is packed into `state` too so we can land the user on the right /account.
 *
 * Requires GOOGLE_CLIENT_ID. The redirect_uri must EXACTLY match the one
 * registered in Google Cloud Console:
 *   https://autodiaspora.com/api/auth/google/callback
 */

import { NextResponse, type NextRequest } from "next/server";
import crypto from "node:crypto";
import { routing } from "@/i18n/routing";

const STATE_COOKIE = "g_oauth_state";
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const localeParam = url.searchParams.get("locale") ?? routing.defaultLocale;
  const locale = (routing.locales as readonly string[]).includes(localeParam)
    ? localeParam
    : routing.defaultLocale;

  // Public site origin — behind nginx request.url is the internal localhost.
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || url.origin;

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(
      `${origin}/${locale}/auth/login?error=google`
    );
  }

  // Must match the redirect URI registered in Google Cloud Console exactly.
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ?? `${origin}/api/auth/google/callback`;

  // Optional post-login destination. Only internal paths (single leading
  // "/") are honoured. Packed into `state` as a base64url 3rd segment so it
  // survives the round-trip to Google without colliding with the "." split.
  const nextRaw = url.searchParams.get("next") ?? "";
  const next =
    nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "";

  const nonce = crypto.randomUUID();
  const state = next
    ? `${nonce}.${locale}.${Buffer.from(next).toString("base64url")}`
    : `${nonce}.${locale}`;

  const authUrl = new URL(GOOGLE_AUTH_URL);
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("access_type", "online");
  authUrl.searchParams.set("prompt", "select_account");

  const res = NextResponse.redirect(authUrl.toString());
  // sameSite "lax" so the cookie rides along on Google's top-level GET
  // redirect back to us (strict would drop it and break the CSRF check).
  res.cookies.set(STATE_COOKIE, nonce, {
    httpOnly: true,
    secure: origin.startsWith("https://"),
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return res;
}
