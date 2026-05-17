import { setRequestLocale } from "next-intl/server";
import { NavCats } from "@/components/NavCats";
import { Hero } from "@/components/Hero";
import { Sidebar } from "@/components/Sidebar";
import { ResultsHeader } from "@/components/ResultsHeader";
import { ListingGrid } from "@/components/ListingGrid";
import { Pagination } from "@/components/Pagination";
import { MOCK_LISTINGS, PAGE_SIZE } from "@/lib/mock-listings";

export default async function HomePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const sp = await searchParams;
  const pageRaw = Number(sp?.page);
  const totalPages = Math.ceil(MOCK_LISTINGS.length / PAGE_SIZE);
  const page = Number.isFinite(pageRaw) && pageRaw >= 1 && pageRaw <= totalPages ? pageRaw : 1;

  return (
    <>
      <NavCats />

      <div className="max-w-[1400px] w-full mx-auto px-6 py-6 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-5">
        <Sidebar />

        <div className="flex flex-col gap-3.5">
          <Hero />
          <ResultsHeader />
          <ListingGrid page={page} />
          <Pagination currentPage={page} totalPages={totalPages} baseHref="/" />
        </div>
      </div>
    </>
  );
}
