"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { routing } from "@/i18n/routing";
import { sendNewMessageEmail } from "@/lib/email";

type Locale = (typeof routing.locales)[number];

function pickLocale(value: FormDataEntryValue | null): Locale {
  const v = typeof value === "string" ? value : "";
  return (routing.locales as readonly string[]).includes(v)
    ? (v as Locale)
    : (routing.defaultLocale as Locale);
}

function pickUuid(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value
  )
    ? value
    : null;
}

function pickText(formData: FormData, key: string, max: number): string {
  const v = formData.get(key);
  if (typeof v !== "string") return "";
  return v.trim().slice(0, max);
}

/**
 * Open (or create) a chat between current user (buyer) and the seller of
 * the given listing. Redirects to the chat detail page.
 */
export async function openChatAction(formData: FormData) {
  const locale = pickLocale(formData.get("locale"));
  const listingId = pickUuid(formData.get("listing_id"));
  if (!listingId) redirect(`/${locale}`);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  // Fetch listing to get seller_id
  const { data: listing } = await supabase
    .from("listings")
    .select("user_id")
    .eq("id", listingId)
    .single<{ user_id: string }>();

  if (!listing) redirect(`/${locale}`);
  // Can't chat with yourself
  if (listing.user_id === user.id) {
    redirect(`/${locale}/listing/${listingId}?self=1`);
  }

  // Try to find existing chat (unique constraint on listing_id+buyer_id+seller_id)
  const { data: existing } = await supabase
    .from("chats")
    .select("id")
    .eq("listing_id", listingId)
    .eq("buyer_id", user.id)
    .eq("seller_id", listing.user_id)
    .maybeSingle<{ id: string }>();

  let chatId = existing?.id;

  if (!chatId) {
    const { data: created } = await supabase
      .from("chats")
      .insert({
        listing_id: listingId,
        buyer_id: user.id,
        seller_id: listing.user_id,
      })
      .select("id")
      .single<{ id: string }>();
    chatId = created?.id;
  }

  if (!chatId) redirect(`/${locale}/listing/${listingId}?error=chat`);

  redirect(`/${locale}/account/messages/${chatId}`);
}

/**
 * Send a message in an existing chat. Returns nothing — Realtime delivers
 * the row to the open chat window.
 */
export async function sendMessageAction(formData: FormData) {
  const chatId = pickUuid(formData.get("chat_id"));
  const body = pickText(formData, "body", 2000);
  if (!chatId || body.length === 0) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("messages")
    .insert({ chat_id: chatId, sender_id: user.id, body });
  // No revalidate — the chat page subscribes to Realtime, message will
  // arrive that way. Unread counts in /account get refreshed on next visit.

  // Fire-and-forget email notification to the other side. Realtime
  // covers the case where they have the chat tab open; email reaches
  // them when they don't. Failures are swallowed by sendEmail() — never
  // block a chat message on Resend being down.
  notifyChatRecipient(chatId, user.id, body).catch((err) => {
    console.error("[chat] notify email failed:", err);
  });
}

async function notifyChatRecipient(
  chatId: string,
  senderId: string,
  body: string
): Promise<void> {
  const admin = createAdminClient();
  const { data: chat } = await admin
    .from("chats")
    .select(
      "buyer_id, seller_id, listing:listings(brand, model)"
    )
    .eq("id", chatId)
    .maybeSingle<{
      buyer_id: string;
      seller_id: string;
      listing: { brand: string; model: string } | null;
    }>();
  if (!chat) return;

  const recipientId = chat.buyer_id === senderId ? chat.seller_id : chat.buyer_id;
  if (!recipientId || recipientId === senderId) return;

  const [{ data: senderUser }, { data: recipientUser }] = await Promise.all([
    admin.auth.admin.getUserById(senderId),
    admin.auth.admin.getUserById(recipientId),
  ]);
  const recipientEmail = recipientUser.user?.email;
  if (!recipientEmail) return;

  const { data: senderProfile } = await admin
    .from("profiles")
    .select("full_name")
    .eq("id", senderId)
    .maybeSingle<{ full_name: string | null }>();
  const senderName =
    senderProfile?.full_name?.trim() ||
    senderUser.user?.email?.split("@")[0] ||
    "Користувач";

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://autodiaspora.com";
  const listingTitle = chat.listing
    ? `${chat.listing.brand} ${chat.listing.model}`
    : "оголошення";

  await sendNewMessageEmail({
    to: recipientEmail,
    fromName: senderName,
    preview: body,
    chatUrl: `${siteUrl}/uk/account/messages/${chatId}`,
    listingTitle,
  });
}

/**
 * Mark all unread messages in a chat (from the counterpart) as read.
 * Called from the chat detail page on mount via a non-blocking action.
 */
export async function markChatReadAction(formData: FormData) {
  const chatId = pickUuid(formData.get("chat_id"));
  if (!chatId) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("chat_id", chatId)
    .neq("sender_id", user.id)
    .is("read_at", null);

  const locale = pickLocale(formData.get("locale"));
  revalidatePath(`/${locale}/account/messages`);
  revalidatePath(`/${locale}/account`);
}
