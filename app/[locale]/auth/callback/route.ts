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
  const next = url.searchParams.get("next") ?? `/${locale}/account`;

  if (!code) {
    return NextResponse.redirect(
      new URL(`/${locale}/auth/login?error=unknown`, request.url)
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(`/${locale}/auth/login?error=unknown`, request.url)
    );
  }

  return NextResponse.redirect(new URL(next, request.url));
}
