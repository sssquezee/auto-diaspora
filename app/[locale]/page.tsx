import { setRequestLocale } from "next-intl/server";
import { NavCats } from "@/components/NavCats";
import { Hero } from "@/components/Hero";
import { Sidebar } from "@/components/Sidebar";
import { ResultsHeader } from "@/components/ResultsHeader";
import { ActiveFilterChips } from "@/components/ActiveFilterChips";
import { ListingGrid } from "@/components/ListingGrid";
import { Pagination } from "@/components/Pagination";
import { PAGE_SIZE } from "@/lib/mock-listings";
import { getFilteredListings } from "@/lib/listings";
import { getFavoritesState } from "@/lib/favorites-server";
import { getSavedSearchesState } from "@/lib/saved-searches-server";
import { buildSearchString, parseFilters } from "@/lib/filters";

export default async function HomePage({
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

  // Filtering / sorting / paginating happens in SQL (single round-trip)
  const [{ listings: slice, total }, favState, savedState] = await Promise.all(
    [
      getFilteredListings(filters, PAGE_SIZE),
      getFavoritesState(),
      getSavedSearchesState(),
    ]
  );
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(filters.page, totalPages);

  // Build query string of active filters to preserve across pagination links
  const baseQuery = buildSearchString({ ...filters, page: 1 });

  return (
    <>
      <NavCats />

      <div className="max-w-[1400px] w-full mx-auto px-6 py-6 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-5">
        <Sidebar />

        <div className="flex flex-col gap-3.5">
          <Hero />
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
            baseHref="/"
            preserveQuery={baseQuery}
          />
        </div>
      </div>
    </>
  );
}
