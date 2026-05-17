"use client";

import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useSavedSearches } from "@/hooks/useSavedSearches";
import type { Locale } from "@/lib/mock-listings";

type Labels = {
  empty: string;
  emptyCta: string;
  open: string;
  remove: string;
  confirmRemove: string;
  createdAt: string;
};

export function SavedSearchesList({ labels }: { labels: Labels }) {
  const { items, hydrated, removeItem } = useSavedSearches();
  const locale = useLocale() as Locale;

  if (!hydrated) {
    return (
      <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-muted px-6 py-12 text-center">
        …
      </div>
    );
  }

  if (items.length === 0) {
    return (
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
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <p className="font-sans text-[14px] text-ink-muted max-w-md mx-auto mb-5 leading-relaxed">
          {labels.empty}
        </p>
        <Link
          href="/search"
          className="inline-block bg-accent hover:bg-accent-2 text-white font-sans font-extrabold text-[12px] uppercase tracking-[0.13em] px-5 py-3 no-underline transition-colors"
        >
          {labels.emptyCta}
        </Link>
      </div>
    );
  }

  const dateFmt = new Intl.DateTimeFormat(
    locale === "uk" ? "uk-UA" : locale === "ru" ? "ru-RU" : "en-US",
    { day: "2-digit", month: "short", year: "numeric" }
  );

  const handleRemove = (id: string, name: string) => {
    if (window.confirm(labels.confirmRemove.replace("{name}", name))) {
      removeItem(id);
    }
  };

  return (
    <div className="bg-white border-[1.5px] border-ink divide-y divide-line">
      {items.map((item) => {
        const created = new Date(item.createdAt);
        return (
          <div
            key={item.id}
            className="flex items-start gap-4 px-5 py-4 flex-wrap"
          >
            <div className="flex-1 min-w-0">
              <div className="font-sans font-extrabold text-[15px] uppercase tracking-[-0.01em] text-ink mb-1 truncate">
                {item.name}
              </div>
              <div className="font-mono text-[11px] text-ink-muted leading-relaxed break-words">
                {item.summary}
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faded mt-2">
                {labels.createdAt} {dateFmt.format(created)}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Link
                href={`/search${item.query}`}
                className="bg-accent hover:bg-accent-2 text-white font-sans font-extrabold text-[11px] uppercase tracking-[0.12em] px-3 py-2 no-underline transition-colors"
              >
                {labels.open} →
              </Link>
              <button
                type="button"
                onClick={() => handleRemove(item.id, item.name)}
                aria-label={labels.remove}
                title={labels.remove}
                className="w-9 h-9 grid place-items-center bg-white border-[1.5px] border-ink text-ink hover:bg-ink hover:text-white cursor-pointer transition-colors"
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
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                </svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
