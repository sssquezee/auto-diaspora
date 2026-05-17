import { setRequestLocale } from "next-intl/server";
import { NavCats } from "@/components/NavCats";
import { Hero } from "@/components/Hero";
import { Sidebar } from "@/components/Sidebar";
import { ResultsHeader } from "@/components/ResultsHeader";
import { ListingGrid } from "@/components/ListingGrid";
import { Pagination } from "@/components/Pagination";
import { MOCK_LISTINGS, PAGE_SIZE } from "@/lib/mock-listings";
import { applyFilters, applySort, buildSearchString, parseFilters } from "@/lib/filters";

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

  // Apply filters + sort
  const filtered = applyFilters(MOCK_LISTINGS, filters);
  const sorted = applySort(filtered, filters.sortBy);

  // Pagination on filtered set
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const page = Math.min(filters.page, totalPages);
  const start = (page - 1) * PAGE_SIZE;
  const slice = sorted.slice(start, start + PAGE_SIZE);

  // Build query string of active filters to preserve across pagination links
  const baseQuery = buildSearchString({ ...filters, page: 1 });

  return (
    <>
      <NavCats />

      <div className="max-w-[1400px] w-full mx-auto px-6 py-6 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-5">
        <Sidebar />

        <div className="flex flex-col gap-3.5">
          <Hero />
          <ResultsHeader count={sorted.length} />
          <ListingGrid listings={slice} />
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
