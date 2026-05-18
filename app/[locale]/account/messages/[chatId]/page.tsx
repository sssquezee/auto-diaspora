import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ChatRoom } from "@/components/ChatRoom";
import { createClient } from "@/lib/supabase/server";
import { getChatById, getChatMessages } from "@/lib/chats-server";
import type { Locale } from "@/lib/mock-listings";

export default async function ChatDetailPage({
  params,
}: {
  params: Promise<{ locale: string; chatId: string }>;
}) {
  const { locale: localeParam, chatId } = await params;
  setRequestLocale(localeParam);
  const locale = localeParam as Locale;

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(chatId)) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  const chat = await getChatById(chatId);
  if (!chat) notFound();

  const messages = await getChatMessages(chatId);

  const t = await getTranslations("Account.messages.chat");

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/account/messages"
        className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted hover:text-accent no-underline self-start"
      >
        ← {t("back")}
      </Link>

      <header className="bg-white border-[1.5px] border-ink p-4 flex items-center gap-3 flex-wrap">
        <div className="w-12 h-12 bg-accent text-white grid place-items-center font-sans font-black text-[15px] flex-shrink-0">
          {chat.counterpart.initials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-sans font-extrabold text-[15px] uppercase tracking-[-0.01em] text-ink truncate">
            {chat.counterpart.name}
          </div>
          <div className="font-mono text-[11px] text-ink-muted mt-0.5">
            {chat.iAmSeller ? t("asSeller") : t("asBuyer")}
          </div>
        </div>

        <Link
          href={`/listing/${chat.listing.id}`}
          className="no-underline border-[1.5px] border-ink px-3 py-2 bg-white hover:bg-ink hover:text-white text-ink transition-colors flex items-center gap-2 max-w-full"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">
            {t("about")}
          </span>
          <span className="font-sans font-bold text-[13px] uppercase tracking-[-0.01em] truncate">
            {chat.listing.title}
          </span>
        </Link>
      </header>

      <ChatRoom
        chatId={chat.id}
        currentUserId={user.id}
        initialMessages={messages.map((m) => ({
          id: m.id,
          author: m.sender_id === user.id ? "me" : "them",
          body: m.body,
          createdAt: m.created_at,
        }))}
        labels={{
          todayLabel: t("day.today"),
          yesterdayLabel: t("day.yesterday"),
          earlierLabel: t("day.earlier"),
          composerPlaceholder: t("composer.placeholder"),
          sendLabel: t("composer.send"),
          sendHint: t("composer.sendHint"),
        }}
      />
    </div>
  );
}
