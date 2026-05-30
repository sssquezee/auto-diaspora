/**
 * Telegram Login Widget callback (redirect mode).
 *
 * The widget redirects the browser here with the signed user payload as
 * query params: id, first_name, last_name?, username?, photo_url?,
 * auth_date, hash. We:
 *   1. Verify the hash (HMAC-SHA256 over the data-check-string, keyed by
 *      SHA256(bot_token)) and reject stale auth_date.
 *   2. Find-or-create a Supabase user keyed by telegram_id (synthetic
 *      email since Telegram gives us no email — profiles.email is NOT NULL).
 *   3. Establish a session by setting a one-time random password and
 *      signing in with it on the cookie-bound client.
 *   4. Redirect to /{locale}/account.
 *
 * Requires TELEGRAM_BOT_TOKEN. The bot's domain must be registered with
 * @BotFather (/setdomain) for the widget to render at all.
 */

import { NextResponse, type NextRequest } from "next/server";
import crypto from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { routing } from "@/i18n/routing";

// Reject payloads older than this — limits replay of a leaked auth URL.
const MAX_AUTH_AGE_S = 24 * 60 * 60;

function verifyTelegramAuth(
  params: Record<string, string>,
  botToken: string
): boolean {
  const { hash, ...rest } = params;
  if (!hash) return false;
  const checkString = Object.keys(rest)
    .sort()
    .map((k) => `${k}=${rest[k]}`)
    .join("\n");
  const secret = crypto.createHash("sha256").update(botToken).digest();
  const computed = crypto
    .createHmac("sha256", secret)
    .update(checkString)
    .digest("hex");
  // Constant-time compare to avoid timing leaks.
  const a = Buffer.from(computed, "hex");
  const b = Buffer.from(hash, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const localeParam = url.searchParams.get("locale") ?? routing.defaultLocale;
  const locale = (routing.locales as readonly string[]).includes(localeParam)
    ? localeParam
    : routing.defaultLocale;

  // Build redirects from the public site origin, not request.url — behind
  // nginx the latter is the internal http://localhost:3001, which would
  // bounce the user to a dead localhost URL after a successful login.
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || url.origin;
  const redirectTo = (path: string) =>
    NextResponse.redirect(`${origin}${path}`);

  const fail = () => redirectTo(`/${locale}/auth/login?error=telegram`);

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return fail();

  // Collect Telegram-supplied params (ignore our own `locale`).
  const params: Record<string, string> = {};
  for (const [key, value] of url.searchParams.entries()) {
    if (key !== "locale") params[key] = value;
  }

  if (!params.id || !params.hash || !params.auth_date) return fail();
  if (!verifyTelegramAuth(params, botToken)) return fail();

  const authDate = Number(params.auth_date);
  const nowS = Math.floor(Date.now() / 1000);
  if (!Number.isFinite(authDate) || nowS - authDate > MAX_AUTH_AGE_S) {
    return fail();
  }

  const telegramId = Number(params.id);
  if (!Number.isFinite(telegramId)) return fail();

  const fullName = [params.first_name, params.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  const admin = createAdminClient();

  // Telegram-supplied display fields, refreshed on every login.
  const tgFields = {
    telegram_username: params.username ?? null,
    full_name: fullName || null,
    avatar_url: params.photo_url ?? null,
  };

  // 1. Find existing user by telegram_id, else create one.
  const { data: existing } = await admin
    .from("profiles")
    .select("id,email")
    .eq("telegram_id", telegramId)
    .maybeSingle<{ id: string; email: string }>();

  let userId: string;
  let email: string;

  if (existing) {
    userId = existing.id;
    email = existing.email;
    await admin.from("profiles").update(tgFields).eq("id", userId);
  } else {
    // No email from Telegram → synthetic, unique, satisfies NOT NULL.
    email = `tg${telegramId}@telegram.autodiaspora.app`;
    const { data: created, error: createErr } =
      await admin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { provider: "telegram", telegram_id: telegramId, ...tgFields },
      });
    if (createErr || !created.user) return fail();
    userId = created.user.id;
    // The handle_new_user trigger already inserted the profile row;
    // fill in the Telegram-specific columns.
    await admin
      .from("profiles")
      .update({ telegram_id: telegramId, ...tgFields })
      .eq("id", userId);
  }

  // 2. Establish a session via a one-time random password.
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

  return redirectTo(`/${locale}/account`);
}
