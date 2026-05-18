/**
 * Server-side chat queries.
 *
 * Chat membership is gated by RLS (`auth.uid() in (buyer_id, seller_id)`),
 * so a single `select` is enough — no extra ownership check needed.
 */

import { createClient } from "@/lib/supabase/server";
import type { Locale } from "@/lib/mock-listings";

export type ChatRow = {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  last_message_at: string;
};

export type ChatListItem = {
  id: string;
  listingId: string;
  listingTitle: string;
  counterpart: {
    name: string;
    initials: string;
  };
  lastMessageText: string;
  lastMessageAt: string;
  /** "Sept 14" / "10:23" / "yesterday" — already formatted for current locale. */
  timestampLabel: string;
  unread: number;
};

export type ChatDetail = {
  id: string;
  listing: {
    id: string;
    title: string;
    status: string;
  };
  /** Seller id, useful for review eligibility on the buyer side. */
  sellerId: string;
  counterpart: {
    id: string;
    name: string;
    initials: string;
  };
  /** True when current user is the seller (owns the listing). */
  iAmSeller: boolean;
};

export type ChatMessageRow = {
  id: string;
  chat_id: string;
  sender_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

type ProfileLite = {
  id: string;
  full_name: string | null;
  email: string;
};

function profileLabel(p: ProfileLite | null | undefined): {
  name: string;
  initials: string;
} {
  const source = p?.full_name?.trim() || p?.email?.split("@")[0] || "—";
  const parts = source.split(/\s+/).filter(Boolean);
  const initials =
    (parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`
      : source.slice(0, 2)
    ).toUpperCase();
  return { name: source, initials };
}

function formatTimestamp(iso: string, locale: Locale): string {
  const now = new Date();
  const then = new Date(iso);
  const sameDay =
    now.getFullYear() === then.getFullYear() &&
    now.getMonth() === then.getMonth() &&
    now.getDate() === then.getDate();

  if (sameDay) {
    return `${String(then.getHours()).padStart(2, "0")}:${String(
      then.getMinutes()
    ).padStart(2, "0")}`;
  }

  const dayDiff = Math.floor(
    (now.getTime() - then.getTime()) / 86_400_000
  );
  if (dayDiff === 1) {
    return locale === "uk" ? "вчора" : locale === "ru" ? "вчера" : "yesterday";
  }
  const tag = locale === "uk" ? "uk-UA" : locale === "ru" ? "ru-RU" : "en-US";
  return new Intl.DateTimeFormat(tag, { day: "2-digit", month: "short" }).format(
    then
  );
}

export async function listMyChats(locale: Locale): Promise<ChatListItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // 1. All chats where current user is buyer OR seller
  const { data: chats } = await supabase
    .from("chats")
    .select(
      "id, listing_id, buyer_id, seller_id, last_message_at, listings(title)"
    )
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order("last_message_at", { ascending: false });

  if (!chats || chats.length === 0) return [];

  const chatIds = chats.map((c) => (c as { id: string }).id);

  // 2. Counterpart profiles + last message bodies + unread counts (3 batched queries)
  const counterpartIds = chats.map((c) => {
    const row = c as { buyer_id: string; seller_id: string };
    return row.buyer_id === user.id ? row.seller_id : row.buyer_id;
  });

  const [{ data: profiles }, { data: lastMessages }, { data: unreadMessages }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", counterpartIds),
      supabase
        .from("messages")
        .select("chat_id, body, created_at")
        .in("chat_id", chatIds)
        .order("created_at", { ascending: false }),
      supabase
        .from("messages")
        .select("chat_id")
        .in("chat_id", chatIds)
        .is("read_at", null)
        .neq("sender_id", user.id),
    ]);

  const profileById = new Map(
    (profiles ?? []).map((p) => [(p as ProfileLite).id, p as ProfileLite])
  );

  const lastByChat = new Map<string, { body: string; created_at: string }>();
  for (const m of (lastMessages ?? []) as Array<{
    chat_id: string;
    body: string;
    created_at: string;
  }>) {
    if (!lastByChat.has(m.chat_id)) {
      lastByChat.set(m.chat_id, { body: m.body, created_at: m.created_at });
    }
  }

  const unreadByChat = new Map<string, number>();
  for (const m of (unreadMessages ?? []) as Array<{ chat_id: string }>) {
    unreadByChat.set(m.chat_id, (unreadByChat.get(m.chat_id) ?? 0) + 1);
  }

  return chats.map((c) => {
    const row = c as {
      id: string;
      listing_id: string;
      buyer_id: string;
      seller_id: string;
      last_message_at: string;
      listings: { title: string } | { title: string }[] | null;
    };
    const listingTitle = Array.isArray(row.listings)
      ? row.listings[0]?.title ?? "—"
      : row.listings?.title ?? "—";
    const counterpartId =
      row.buyer_id === user.id ? row.seller_id : row.buyer_id;
    const last = lastByChat.get(row.id);
    return {
      id: row.id,
      listingId: row.listing_id,
      listingTitle,
      counterpart: profileLabel(profileById.get(counterpartId)),
      lastMessageText: last?.body ?? "—",
      lastMessageAt: last?.created_at ?? row.last_message_at,
      timestampLabel: formatTimestamp(
        last?.created_at ?? row.last_message_at,
        locale
      ),
      unread: unreadByChat.get(row.id) ?? 0,
    };
  });
}

export async function getChatById(id: string): Promise<ChatDetail | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: chat } = await supabase
    .from("chats")
    .select(
      "id, listing_id, buyer_id, seller_id, listings(id, title, user_id, status)"
    )
    .eq("id", id)
    .maybeSingle();

  if (!chat) return null;
  const row = chat as {
    id: string;
    listing_id: string;
    buyer_id: string;
    seller_id: string;
    listings:
      | { id: string; title: string; user_id: string; status: string }
      | { id: string; title: string; user_id: string; status: string }[]
      | null;
  };

  const iAmSeller = row.seller_id === user.id;
  const counterpartId = iAmSeller ? row.buyer_id : row.seller_id;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("id", counterpartId)
    .single<ProfileLite>();

  const listing = Array.isArray(row.listings) ? row.listings[0] : row.listings;
  const labels = profileLabel(profile);

  return {
    id: row.id,
    listing: {
      id: listing?.id ?? row.listing_id,
      title: listing?.title ?? "—",
      status: listing?.status ?? "active",
    },
    sellerId: row.seller_id,
    counterpart: {
      id: counterpartId,
      name: labels.name,
      initials: labels.initials,
    },
    iAmSeller,
  };
}

export async function getChatMessages(
  chatId: string
): Promise<ChatMessageRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("messages")
    .select("id, chat_id, sender_id, body, read_at, created_at")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });
  return (data ?? []) as ChatMessageRow[];
}
