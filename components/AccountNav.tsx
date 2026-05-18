"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { signOutAction } from "@/app/[locale]/auth/actions";

type NavItem = {
  key: "overview" | "listings" | "favorites" | "messages" | "searches" | "settings";
  href: string;
  badge?: string | "favoritesLive";
};

const NAV_ITEMS: NavItem[] = [
  { key: "overview", href: "/account" },
  { key: "listings", href: "/account/listings", badge: "2" },
  { key: "favorites", href: "/account/favorites", badge: "favoritesLive" },
  { key: "messages", href: "/account/messages", badge: "1" },
  { key: "searches", href: "/account/searches" },
  { key: "settings", href: "/account/settings" },
];

export function AccountNav({
  favoritesCount = 0,
  isAdmin = false,
}: {
  favoritesCount?: number;
  isAdmin?: boolean;
}) {
  const t = useTranslations("Account.nav");
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <aside
      aria-label="Account navigation"
      className="hidden md:flex md:flex-col bg-white border-[1.5px] border-ink h-fit sticky top-3.5"
    >
      <div className="bg-ink text-white px-4 py-3 font-sans font-extrabold text-[12px] tracking-[0.16em] uppercase">
        {t("title")}
      </div>

      <nav className="flex flex-col">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/account"
              ? pathname === "/account"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex items-center justify-between gap-3 px-4 py-3 no-underline font-sans text-[13px] font-semibold uppercase tracking-[0.06em] border-b border-line last:border-b-0 transition-colors ${
                isActive
                  ? "bg-bg-subtle text-ink border-l-[3px] border-l-accent pl-[13px]"
                  : "text-ink-muted hover:text-ink hover:bg-bg-subtle"
              }`}
            >
              <span>{t(item.key)}</span>
              {item.badge && (() => {
                const value =
                  item.badge === "favoritesLive" ? favoritesCount : Number(item.badge);
                if (item.badge === "favoritesLive" && value === 0) return null;
                return (
                  <span
                    className={`font-mono text-[10px] font-bold px-1.5 py-px ${
                      isActive
                        ? "bg-accent text-white"
                        : "bg-bg-subtle text-ink-muted border border-line-strong"
                    }`}
                  >
                    {value}
                  </span>
                );
              })()}
            </Link>
          );
        })}

        {isAdmin && (
          <Link
            href="/admin/queue"
            className="flex items-center gap-3 px-4 py-3 no-underline font-sans text-[13px] font-extrabold uppercase tracking-[0.06em] border-t border-accent bg-accent-soft text-ink hover:bg-accent hover:text-white transition-colors"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            {t("admin")}
          </Link>
        )}

        <form action={signOutAction}>
          <input type="hidden" name="locale" value={locale} />
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-4 py-3 bg-transparent border-0 border-t border-line cursor-pointer font-sans text-[13px] font-semibold uppercase tracking-[0.06em] text-ink-muted hover:text-accent hover:bg-bg-subtle transition-colors text-left"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {t("logout")}
          </button>
        </form>
      </nav>
    </aside>
  );
}
