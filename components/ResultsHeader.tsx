"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import {
  type SortKey,
  DEFAULT_SORT,
  buildSearchString,
  parseFilters,
} from "@/lib/filters";
import { formatMileage, type Locale } from "@/lib/mock-listings";
import { SaveSearchButton } from "./SaveSearchButton";

function GridViewIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}

function ListViewIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

type Props = {
  count: number;
  isAuthed: boolean;
  savedQueries: string[];
};

export function ResultsHeader({ count, isAuthed, savedQueries }: Props) {
  const t = useTranslations("Results");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const raw: Record<string, string | string[] | undefined> = {};
  searchParams.forEach((value, key) => {
    raw[key] = value;
  });
  const filters = parseFilters(raw);

  const handleSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as SortKey;
    router.push(
      `${pathname}${buildSearchString({
        ...filters,
        sortBy: next === DEFAULT_SORT ? undefined : next,
        page: 1,
      })}`
    );
  };

  const countFormatted = formatMileage(count, locale);

  return (
    <div className="flex justify-between items-center gap-4 flex-wrap">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="font-sans text-[13px] text-ink-muted">
          {t("count", { count: countFormatted })}
        </div>
        <SaveSearchButton isAuthed={isAuthed} savedQueries={savedQueries} />
      </div>

      <div className="flex items-center gap-3">
        <select
          aria-label="Sort"
          value={filters.sortBy}
          onChange={handleSort}
          className="font-sans text-[13px] font-medium border-[1.5px] border-ink bg-white px-3 py-2 text-ink outline-none cursor-pointer appearance-none pr-8"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%230a0a0a' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 10px center",
          }}
        >
          <option value="premium">{t("sort.premium")}</option>
          <option value="newest">{t("sort.newest")}</option>
          <option value="priceAsc">{t("sort.priceAsc")}</option>
          <option value="priceDesc">{t("sort.priceDesc")}</option>
          <option value="mileage">{t("sort.mileage")}</option>
        </select>

        <div className="flex border-[1.5px] border-ink">
          <button
            type="button"
            aria-label="Grid view"
            className="w-9 h-9 grid place-items-center bg-ink text-white cursor-pointer"
          >
            <GridViewIcon />
          </button>
          <button
            type="button"
            aria-label="List view"
            className="w-9 h-9 grid place-items-center bg-white text-ink border-l-[1.5px] border-ink cursor-pointer hover:bg-ink hover:text-white transition-colors"
          >
            <ListViewIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
