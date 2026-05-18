import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { listMyChats } from "@/lib/chats-server";
import type { Locale } from "@/lib/mock-listings";

export default async function MessagesPage() {
  const t = await getTranslations("Account.messages");
  const locale = (await getLocale()) as Locale;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  const chats = await listMyChats(locale);

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="font-sans font-black text-[28px] sm:text-[36px] uppercase tracking-[-0.04em] leading-none text-ink">
          {t("title")}
        </h1>
        <p className="font-sans text-[13px] text-ink-muted mt-2">
          {t("subtitle", { count: chats.length })}
        </p>
      </header>

      {chats.length === 0 ? (
        <div className="bg-white border-[1.5px] border-ink px-6 py-16 text-center">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto mb-4 text-ink-faded"
            aria-hidden
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <p className="font-sans text-[14px] text-ink-muted max-w-md mx-auto leading-relaxed">
            {t("empty")}
          </p>
        </div>
      ) : (
        <div className="bg-white border-[1.5px] border-ink divide-y divide-line">
          {chats.map((chat) => (
            <Link
              key={chat.id}
              href={`/account/messages/${chat.id}`}
              className="flex items-start gap-3 px-5 py-4 no-underline text-ink hover:bg-bg-subtle transition-colors"
            >
              <div className="w-10 h-10 bg-accent text-white grid place-items-center font-sans font-black text-[13px] flex-shrink-0">
                {chat.counterpart.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-3 mb-1">
                  <div className="font-sans font-bold text-[14px] text-ink truncate">
                    {chat.counterpart.name}
                  </div>
                  <div className="font-mono text-[11px] text-ink-faded flex-shrink-0">
                    {chat.timestampLabel}
                  </div>
                </div>
                <div className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-muted mb-1.5 truncate">
                  {chat.listingTitle}
                </div>
                <div className="font-sans text-[13px] text-ink-muted line-clamp-1">
                  {chat.lastMessageText}
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
      )}
    </div>
  );
}
