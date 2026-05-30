/**
 * Telegram callback webhook.
 *
 * Receives `callback_query` events when an admin taps Approve/Reject in
 * a notification. Verifies the secret token from setWebhook, then runs
 * the action via the service-role client (RLS bypass) and edits the
 * original message in the chat to mark it handled.
 *
 * Set up:
 *   1. Expose the dev server via ngrok / cloudflared (or deploy first).
 *   2. Generate a long random string for TELEGRAM_WEBHOOK_SECRET.
 *   3. Call once:
 *      curl "https://api.telegram.org/bot<TOKEN>/setWebhook?\
 *        url=<PUBLIC_URL>/api/telegram/webhook&\
 *        secret_token=<TELEGRAM_WEBHOOK_SECRET>&\
 *        allowed_updates=[\"callback_query\"]"
 */

import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  answerCallbackQuery,
  editMessageText,
  isAdminChat,
} from "@/lib/telegram";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type CallbackQuery = {
  id: string;
  from: { id: number };
  message?: {
    message_id: number;
    chat: { id: number };
    text?: string;
  };
  data?: string;
};

type Update = {
  update_id: number;
  callback_query?: CallbackQuery;
};

export async function POST(request: NextRequest) {
  // 1. Verify webhook secret (Telegram sends X-Telegram-Bot-Api-Secret-Token
  //    when you registered the webhook with secret_token=…).
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (expectedSecret) {
    const got = request.headers.get("x-telegram-bot-api-secret-token");
    if (got !== expectedSecret) {
      return new NextResponse(null, { status: 401 });
    }
  }

  let update: Update;
  try {
    update = (await request.json()) as Update;
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const cb = update.callback_query;
  if (!cb || !cb.data || !cb.message) {
    return NextResponse.json({ ok: true });
  }

  // 2. Verify chat is one of the configured admin chats — keeps any random
  //    user from triggering our actions just by knowing the bot.
  if (!isAdminChat(cb.message.chat.id)) {
    await answerCallbackQuery(cb.id, "Not authorized");
    return NextResponse.json({ ok: true });
  }

  // 3. Parse `ap:<uuid>` / `rj:<uuid>`
  const [opcode, listingId] = cb.data.split(":");
  if (!UUID_RE.test(listingId ?? "")) {
    await answerCallbackQuery(cb.id, "Invalid payload");
    return NextResponse.json({ ok: true });
  }

  const admin = createAdminClient();
  const originalText = cb.message.text ?? "Listing";

  if (opcode === "ap") {
    const { error } = await admin
      .from("listings")
      .update({ status: "active", updated_at: new Date().toISOString() })
      .eq("id", listingId)
      .eq("status", "pending_review");
    if (error) {
      await answerCallbackQuery(cb.id, "Approve failed");
      return NextResponse.json({ ok: true });
    }
    await answerCallbackQuery(cb.id, "Approved ✅");
    await editMessageText(
      cb.message.chat.id,
      cb.message.message_id,
      `${originalText}\n\n<b>✅ Approved</b>`
    );
    return NextResponse.json({ ok: true });
  }

  if (opcode === "rj") {
    // Storage cleanup before delete
    const { data: photos } = await admin
      .from("listing_photos")
      .select("storage_path")
      .eq("listing_id", listingId);
    const paths = (photos ?? [])
      .map((p) => (p as { storage_path: string }).storage_path)
      .filter((p): p is string => typeof p === "string" && p.length > 0);
    if (paths.length > 0) {
      try {
        await admin.storage.from("listings").remove(paths);
      } catch {
        // best-effort
      }
    }
    const { error } = await admin.from("listings").delete().eq("id", listingId);
    if (error) {
      await answerCallbackQuery(cb.id, "Reject failed");
      return NextResponse.json({ ok: true });
    }
    await answerCallbackQuery(cb.id, "Rejected ❌");
    await editMessageText(
      cb.message.chat.id,
      cb.message.message_id,
      `${originalText}\n\n<b>❌ Rejected</b>`
    );
    return NextResponse.json({ ok: true });
  }

  await answerCallbackQuery(cb.id, "Unknown action");
  return NextResponse.json({ ok: true });
}
