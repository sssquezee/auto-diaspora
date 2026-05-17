import { setRequestLocale } from "next-intl/server";
import { NavCats } from "@/components/NavCats";
import { Hero } from "@/components/Hero";
import { ResultsHeader } from "@/components/ResultsHeader";
import { ListingGrid } from "@/components/ListingGrid";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <NavCats />

      <div className="max-w-[1400px] w-full mx-auto px-6 py-6 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-5">
        {/* Sidebar placeholder — filters come in next block */}
        <aside
          aria-hidden
          className="hidden md:block bg-white border-[1.5px] border-ink h-fit sticky top-3.5 p-4 text-ink-muted text-[12px] uppercase tracking-[0.12em]"
        >
          Filters · soon
        </aside>

        <div className="flex flex-col gap-3.5">
          <Hero />
          <ResultsHeader />
          <ListingGrid />
        </div>
      </div>
    </>
  );
}
