/**
 * Telegram Mini App login (initData flow).
 *
 * When the site is opened as a Mini App (via the bot's web_app button),
 * Telegram injects window.Telegram.WebApp.initData — a signed query string
 * identifying the user. The client POSTs it here; we verify the signature
 * and start a Supabase session. NO browser redirect is involved, which is
 * exactly why the Login Widget (oauth.telegram.org) cannot be used inside
 * the Telegram in-app webview.
 *
 * Verification differs from the Login Widget (app/api/auth/telegram):
 *   secret_key = HMAC_SHA256(key="WebAppData", msg=bot_token)
 *   hash       = hex(HMAC_SHA256(key=secret_key, msg=data_check_string))
 * data_check_string = all initData fields EXCEPT `hash` and `signature`,
 * sorted alphabetically, joined by "\n".
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 *
 * Requires TELEGRAM_BOT_TOKEN.
 */

import { NextResponse, type NextRequest } from "next/server";
import crypto from "node:crypto";
import { establishTelegramSession } from "@/lib/telegram-auth";
import { routing } from "@/i18n/routing";

// Reject payloads older than this — limits replay of leaked initData.
const MAX_AUTH_AGE_S = 24 * 60 * 60;

/**
 * Validate initData and return its parsed params, or null if the signature
 * is invalid. Constant-time hash compare to avoid timing leaks.
 */
function verifyInitData(
  initData: string,
  botToken: string
): URLSearchParams | null {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;

  const pairs: string[] = [];
  for (const [key, value] of params.entries()) {
    // Only `hash` (the HMAC itself) is excluded. The newer `signature`
    // field (Telegram's separate Ed25519 signature) MUST stay in the
    // check string — Telegram computes `hash` with it included.
    // Verified empirically against tdesktop 9.6 initData.
    if (key === "hash") continue;
    pairs.push(`${key}=${value}`);
  }
  pairs.sort();
  const dataCheckString = pairs.join("\n");

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();
  const computed = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  const a = Buffer.from(computed, "hex");
  const b = Buffer.from(hash, "hex");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return params;
}

export async function POST(request: NextRequest) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return NextResponse.json({ ok: false }, { status: 500 });

  let body: { initData?: string; locale?: string; next?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const initData = typeof body.initData === "string" ? body.initData : "";
  if (!initData) return NextResponse.json({ ok: false }, { status: 400 });

  const params = verifyInitData(initData, botToken);
  if (!params) return NextResponse.json({ ok: false }, { status: 401 });

  // Freshness check — initData carries auth_date as a Unix timestamp.
  const authDate = Number(params.get("auth_date"));
  const nowS = Math.floor(Date.now() / 1000);
  if (!Number.isFinite(authDate) || nowS - authDate > MAX_AUTH_AGE_S) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  // The `user` field is a JSON-encoded object.
  const userRaw = params.get("user");
  if (!userRaw) return NextResponse.json({ ok: false }, { status: 400 });

  let tgUser: {
    id?: number;
    first_name?: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
  };
  try {
    tgUser = JSON.parse(userRaw);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const telegramId = Number(tgUser.id);
  if (!Number.isFinite(telegramId)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const fullName = [tgUser.first_name, tgUser.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  const ok = await establishTelegramSession({
    telegramId,
    username: tgUser.username ?? null,
    fullName: fullName || null,
    photoUrl: tgUser.photo_url ?? null,
  });
  if (!ok) return NextResponse.json({ ok: false }, { status: 500 });

  // Resolve a safe post-login destination (internal paths only).
  const localeParam = body.locale ?? routing.defaultLocale;
  const locale = (routing.locales as readonly string[]).includes(localeParam)
    ? localeParam
    : routing.defaultLocale;
  const nextRaw = typeof body.next === "string" ? body.next : "";
  const next =
    nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : null;

  return NextResponse.json({ ok: true, redirect: next ?? `/${locale}/account` });
}
