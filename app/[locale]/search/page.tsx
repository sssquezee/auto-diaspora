import { getTranslations, setRequestLocale } from "next-intl/server";
import { Sidebar } from "@/components/Sidebar";
import { ResultsHeader } from "@/components/ResultsHeader";
import { ActiveFilterChips } from "@/components/ActiveFilterChips";
import { ListingGrid } from "@/components/ListingGrid";
import { Pagination } from "@/components/Pagination";
import { SearchInput } from "@/components/SearchInput";
import { PAGE_SIZE } from "@/lib/mock-listings";
import { getFilteredListings } from "@/lib/listings";
import { getFavoritesState } from "@/lib/favorites-server";
import { getSavedSearchesState } from "@/lib/saved-searches-server";
import { buildSearchString, parseFilters } from "@/lib/filters";

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const sp = await searchParams;
  const filters = parseFilters(sp);

  const [{ listings: slice, total }, favState, savedState] = await Promise.all(
    [
      getFilteredListings(filters, PAGE_SIZE),
      getFavoritesState(),
      getSavedSearchesState(),
    ]
  );
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(filters.page, totalPages);

  const baseQuery = buildSearchString({ ...filters, page: 1 });

  const t = await getTranslations("Search");

  return (
    <div className="max-w-[1400px] w-full mx-auto px-6 py-6 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-5">
      <Sidebar />

      <div className="flex flex-col gap-3.5 min-w-0">
        {/* Search header */}
        <section className="bg-white border-[1.5px] border-ink p-5 sm:p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent mb-2">
            {t("kicker")}
          </p>
          <h1 className="font-sans font-black text-[28px] sm:text-[36px] uppercase tracking-[-0.04em] leading-none text-ink mb-4">
            {t("title")}
          </h1>

          <SearchInput
            initialQuery={filters.q ?? ""}
            placeholder={t("placeholder")}
            submitLabel={t("submit")}
            clearLabel={t("clear")}
          />

          {filters.q && (
            <p className="mt-4 font-sans text-[13px] text-ink-muted">
              {t.rich("echo", {
                count: total,
                query: filters.q,
                strong: (chunks) => (
                  <strong className="font-bold text-ink">{chunks}</strong>
                ),
              })}
            </p>
          )}
          {!filters.q && (
            <p className="mt-4 font-sans text-[13px] text-ink-muted">
              {t("hint")}
            </p>
          )}
        </section>

        <ResultsHeader
          count={total}
          isAuthed={savedState.isAuthed}
          savedQueries={Array.from(savedState.savedQueries)}
        />
        <ActiveFilterChips />
        <ListingGrid
          listings={slice}
          isAuthed={favState.isAuthed}
          favoriteIds={favState.favoriteIds}
        />
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          baseHref="/search"
          preserveQuery={baseQuery}
        />
      </div>
    </div>
  );
}
