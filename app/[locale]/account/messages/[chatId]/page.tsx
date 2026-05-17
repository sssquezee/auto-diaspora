import { notFound } from "next/navigation";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ChatRoom } from "@/components/ChatRoom";
import {
  MOCK_CHATS,
  getChatById,
  getMessagesForChat,
} from "@/lib/mock-chats";
import type { Locale } from "@/lib/mock-listings";

export function generateStaticParams() {
  return MOCK_CHATS.map((c) => ({ chatId: c.id }));
}

export default async function ChatDetailPage({
  params,
}: {
  params: Promise<{ locale: string; chatId: string }>;
}) {
  const { locale: localeParam, chatId } = await params;
  setRequestLocale(localeParam);
  const locale = (await getLocale()) as Locale;

  const chat = getChatById(chatId);
  if (!chat) notFound();

  const t = await getTranslations("Account.messages.chat");
  const messages = getMessagesForChat(chat.id);

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/account/messages"
        className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted hover:text-accent no-underline self-start"
      >
        ← {t("back")}
      </Link>

      {/* Header: avatar + name + listing */}
      <header className="bg-white border-[1.5px] border-ink p-4 flex items-center gap-3 flex-wrap">
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 bg-accent text-white grid place-items-center font-sans font-black text-[15px]">
            {chat.buyer.initials}
          </div>
          {chat.buyer.online && (
            <span
              aria-hidden
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-accent border-2 border-white"
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-sans font-extrabold text-[15px] uppercase tracking-[-0.01em] text-ink truncate">
            {chat.buyer.name}
          </div>
          <div className="font-mono text-[11px] text-ink-muted mt-0.5">
            {chat.buyer.online ? t("online") : t("offline")}
          </div>
        </div>

        <Link
          href={`/listing/${chat.listingId}`}
          className="no-underline border-[1.5px] border-ink px-3 py-2 bg-white hover:bg-ink hover:text-white text-ink transition-colors flex items-center gap-2 max-w-full"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">
            {t("about")}
          </span>
          <span className="font-sans font-bold text-[13px] uppercase tracking-[-0.01em] truncate">
            {chat.listingTitle}
          </span>
        </Link>
      </header>

      <ChatRoom
        initial={messages}
        locale={locale}
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
