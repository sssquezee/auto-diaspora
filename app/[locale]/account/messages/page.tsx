import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { MOCK_CHATS } from "@/lib/mock-chats";
import type { Locale } from "@/lib/mock-listings";

export default async function MessagesPage() {
  const t = await getTranslations("Account.messages");
  const locale = (await getLocale()) as Locale;

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="font-sans font-black text-[28px] sm:text-[36px] uppercase tracking-[-0.04em] leading-none text-ink">
          {t("title")}
        </h1>
        <p className="font-sans text-[13px] text-ink-muted mt-2">
          {t("subtitle", { count: MOCK_CHATS.length })}
        </p>
      </header>

      <div className="bg-white border-[1.5px] border-ink divide-y divide-line">
        {MOCK_CHATS.map((chat) => (
          <Link
            key={chat.id}
            href={`/account/messages/${chat.id}`}
            className="flex items-start gap-3 px-5 py-4 no-underline text-ink hover:bg-bg-subtle transition-colors"
          >
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 bg-accent text-white grid place-items-center font-sans font-black text-[13px]">
                {chat.buyer.initials}
              </div>
              {chat.buyer.online && (
                <span
                  aria-hidden
                  className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-accent border-2 border-white"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <div className="font-sans font-bold text-[14px] text-ink truncate">
                  {chat.buyer.name}
                </div>
                <div className="font-mono text-[11px] text-ink-faded flex-shrink-0">
                  {chat.timestamp[locale]}
                </div>
              </div>
              <div className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-muted mb-1.5 truncate">
                {chat.listingTitle}
              </div>
              <div className="font-sans text-[13px] text-ink-muted line-clamp-1">
                {chat.lastMessage[locale]}
              </div>
            </div>
            {chat.unread > 0 && (
              <span className="bg-accent text-white font-mono font-bold text-[10px] px-1.5 py-px flex-shrink-0 mt-1">
                {chat.unread}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
