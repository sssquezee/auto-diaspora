"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { removeSavedSearchAction } from "@/app/[locale]/account/searches/actions";

type Item = {
  id: string;
  name: string;
  query: string;
  summary: string;
  createdAt: string;
};

type Labels = {
  open: string;
  remove: string;
  confirmRemove: string;
  createdAt: string;
};

export function SavedSearchesList({
  items,
  locale,
  labels,
}: {
  items: Item[];
  locale: string;
  labels: Labels;
}) {
  const currentLocale = useLocale();
  const [, startTransition] = useTransition();

  const dateFmt = new Intl.DateTimeFormat(
    currentLocale === "uk"
      ? "uk-UA"
      : currentLocale === "ru"
      ? "ru-RU"
      : "en-US",
    { day: "2-digit", month: "short", year: "numeric" }
  );

  const handleRemove = (id: string, name: string) => {
    if (!window.confirm(labels.confirmRemove.replace("{name}", name))) return;
    const fd = new FormData();
    fd.append("id", id);
    fd.append("locale", locale);
    startTransition(async () => {
      await removeSavedSearchAction(fd);
    });
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
