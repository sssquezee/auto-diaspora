import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { routing } from "@/i18n/routing";

/**
 * Email-confirmation callback. Supabase sends users here from the
 * confirmation email with `?code=...`. We exchange the code for a
 * session, then bounce them into /account.
 *
 * On error we route back to /auth/login with a message.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale: localeParam } = await params;
  const locale = (routing.locales as readonly string[]).includes(localeParam)
    ? localeParam
    : routing.defaultLocale;

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  // Only honour internal paths (single leading "/") to avoid open-redirect.
  const nextRaw = url.searchParams.get("next");
  const next =
    nextRaw && nextRaw.startsWith("/") && !nextRaw.startsWith("//")
      ? nextRaw
      : `/${locale}/account`;

  // Behind nginx, request.url is the internal http://localhost:3001 — build
  // redirects from the public origin so users don't land on a dead localhost.
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || url.origin;
  const toPath = (p: string) =>
    NextResponse.redirect(`${origin}${p.startsWith("/") ? p : `/${p}`}`);

  if (!code) {
    return toPath(`/${locale}/auth/login?error=unknown`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return toPath(`/${locale}/auth/login?error=unknown`);
  }

  return toPath(next);
}
