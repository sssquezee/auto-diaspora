/**
 * Telegram Bot API client — admin notifications + callback handling.
 *
 * Required env (otherwise sendAdminNotification is a no-op):
 *   TELEGRAM_BOT_TOKEN     — get from @BotFather
 *   TELEGRAM_ADMIN_CHAT_ID — your personal chat id with the bot
 *                            (or a channel/group id — starts with `-100`)
 *
 * Optional for callback buttons (Approve / Reject in the chat itself):
 *   TELEGRAM_WEBHOOK_SECRET — random string; register webhook with this
 *     secret_token so we can verify incoming requests come from Telegram.
 *
 * Local dev limitation: Telegram won't POST to localhost. To test inline-
 * keyboard callbacks, expose the dev server via ngrok / cloudflared / a
 * deploy preview, then call setWebhook (see README in lib/telegram-setup.md).
 */

const API_BASE = "https://api.telegram.org";

/**
 * Admin chat ids allowed to receive pings and approve/reject — read from
 * TELEGRAM_ADMIN_CHAT_ID (comma-separated, so multiple owners can moderate).
 */
export function adminChatIds(): string[] {
  return (process.env.TELEGRAM_ADMIN_CHAT_ID ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

/** True when the given chat id is one of the configured admins. */
export function isAdminChat(chatId: number | string | undefined): boolean {
  if (chatId === undefined) return false;
  return adminChatIds().includes(String(chatId));
}

export type InlineButton =
  | { text: string; url: string }
  | { text: string; callback_data: string };

type SendMessageInput = {
  text: string;
  /** Rows of inline buttons. Each inner array is one row. */
  buttons?: InlineButton[][];
};

async function callApi(method: string, body: unknown): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;
  try {
    await fetch(`${API_BASE}/bot${token}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });
  } catch (err) {
    console.warn(
      `[telegram] ${method} failed:`,
      err instanceof Error ? err.message : err
    );
  }
}

export async function sendAdminNotification(input: SendMessageInput): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatIds = adminChatIds();
  if (!token || chatIds.length === 0) return;

  // Send to every admin so any of them can approve/reject.
  await Promise.all(
    chatIds.map((chatId) => {
      const body: Record<string, unknown> = {
        chat_id: chatId,
        text: input.text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      };
      if (input.buttons && input.buttons.length > 0) {
        body.reply_markup = { inline_keyboard: input.buttons };
      }
      return callApi("sendMessage", body);
    })
  );
}

/**
 * Show a toast to the user who tapped a button. Must be called within
 * a few seconds of receiving callback_query or Telegram retries.
 */
export async function answerCallbackQuery(
  callbackQueryId: string,
  text?: string
): Promise<void> {
  await callApi("answerCallbackQuery", {
    callback_query_id: callbackQueryId,
    text,
  });
}

/**
 * Replace the original message text and clear its buttons. Used to
 * mark a notification as "handled" (✅ Approved / ❌ Rejected).
 */
export async function editMessageText(
  chatId: number | string,
  messageId: number,
  text: string
): Promise<void> {
  await callApi("editMessageText", {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
  });
}

/** Builder for the "new listing for review" message + buttons. */
export function newListingNotification(input: {
  listingId: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  city: string;
  country: string;
  ownerEmail: string;
  siteUrl: string;
  locale: string;
}): SendMessageInput {
  const title = `${input.brand} ${input.model} · ${input.year}`;
  const text =
    `🚗 <b>New listing for review</b>\n\n` +
    `${title}\n` +
    `€${input.price.toLocaleString()} · ${input.city} (${input.country})\n` +
    `by ${input.ownerEmail}`;
  return {
    text,
    buttons: [
      [
        { text: "✅ Approve", callback_data: `ap:${input.listingId}` },
        { text: "❌ Reject", callback_data: `rj:${input.listingId}` },
      ],
      [
        {
          text: "🔍 View listing",
          url: `${input.siteUrl}/${input.locale}/listing/${input.listingId}`,
        },
      ],
    ],
  };
}
