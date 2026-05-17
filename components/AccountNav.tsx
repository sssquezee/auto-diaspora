"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

const NAV_ITEMS = [
  { key: "overview", href: "/account" },
  { key: "listings", href: "/account/listings", badge: "2" },
  { key: "favorites", href: "/account/favorites", badge: "3" },
  { key: "messages", href: "/account/messages", badge: "1" },
  { key: "searches", href: "/account/searches" },
  { key: "settings", href: "/account/settings" },
] as const;

export function AccountNav() {
  const t = useTranslations("Account.nav");
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
              {"badge" in item && item.badge && (
                <span
                  className={`font-mono text-[10px] font-bold px-1.5 py-px ${
                    isActive
                      ? "bg-accent text-white"
                      : "bg-bg-subtle text-ink-muted border border-line-strong"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <button
          type="button"
          className="flex items-center gap-3 px-4 py-3 bg-transparent border-0 border-t border-line cursor-pointer font-sans text-[13px] font-semibold uppercase tracking-[0.06em] text-ink-muted hover:text-accent hover:bg-bg-subtle transition-colors text-left"
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
      </nav>
    </aside>
  );
}
