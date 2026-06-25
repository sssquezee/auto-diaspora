/**
 * TEMPORARY diagnostic for Mini App initData signature failures.
 *
 * Given the initData, it reports — WITHOUT leaking secrets — which HMAC
 * strategy (if any) reproduces Telegram's hash, and the bot id embedded in
 * the configured token, so we can tell a wrong-token problem from a
 * data-check-string problem. REMOVE once login works.
 */

import { NextResponse, type NextRequest } from "next/server";
import crypto from "node:crypto";

function dataCheckString(params: URLSearchParams, excludeSignature: boolean) {
  const pairs: string[] = [];
  for (const [key, value] of params.entries()) {
    if (key === "hash") continue;
    if (excludeSignature && key === "signature") continue;
    pairs.push(`${key}=${value}`);
  }
  pairs.sort();
  return pairs.join("\n");
}

function hmacHex(key: crypto.BinaryLike | Buffer, msg: string) {
  return crypto.createHmac("sha256", key).update(msg).digest("hex");
}

export async function POST(request: NextRequest) {
  const token = process.env.TELEGRAM_BOT_TOKEN ?? "";
  let body: { initData?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const initData = typeof body.initData === "string" ? body.initData : "";
  if (!initData) return NextResponse.json({ error: "no initData" });

  const params = new URLSearchParams(initData);
  const hash = params.get("hash") ?? "";

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(token)
    .digest();

  const dcsNoSig = dataCheckString(params, true);
  const dcsWithSig = dataCheckString(params, false);
  const hashNoSig = hmacHex(secretKey, dcsNoSig);
  const hashWithSig = hmacHex(secretKey, dcsWithSig);

  // Bot id is the public part of the token (before the colon) — safe to show.
  const botId = token.includes(":") ? token.split(":")[0] : "(no colon)";

  const authDate = Number(params.get("auth_date"));
  const nowS = Math.floor(Date.now() / 1000);

  return NextResponse.json({
    tokenPresent: token.length > 0,
    tokenLength: token.length,
    botIdFromToken: botId,
    hasSignatureField: params.has("signature"),
    keys: Array.from(params.keys()),
    providedHashHead: hash.slice(0, 12),
    matchExcludingSignature: hashNoSig === hash,
    matchIncludingSignature: hashWithSig === hash,
    computedNoSigHead: hashNoSig.slice(0, 12),
    computedWithSigHead: hashWithSig.slice(0, 12),
    authDateAgeSeconds: Number.isFinite(authDate) ? nowS - authDate : null,
  });
}
