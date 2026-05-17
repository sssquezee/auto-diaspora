import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ListingCard } from "@/components/ListingCard";
import { MOCK_LISTINGS } from "@/lib/mock-listings";

const TABS = [
  { key: "active", count: 2, active: true },
  { key: "paused", count: 0 },
  { key: "sold", count: 1 },
  { key: "expired", count: 0 },
] as const;

export default async function MyListingsPage() {
  const t = await getTranslations("Account.listings");

  // Mock: pretend the current user owns listings 4 and 6
  const myListings = MOCK_LISTINGS.filter((l) => l.id === "4" || l.id === "6");

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-sans font-black text-[28px] sm:text-[36px] uppercase tracking-[-0.04em] leading-none text-ink">
          {t("title")}
        </h1>
        <Link
          href="/new"
          className="bg-ink hover:bg-accent text-white font-sans font-extrabold text-[12px] uppercase tracking-[0.13em] px-4 py-2.5 no-underline transition-colors"
        >
          {t("newButton")}
        </Link>
      </header>

      {/* Tabs */}
      <div className="flex border-b-[1.5px] border-ink overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`flex items-center gap-2 px-4 py-2.5 font-sans font-bold text-[12px] uppercase tracking-[0.1em] cursor-pointer bg-transparent border-0 whitespace-nowrap border-b-[3px] -mb-[1.5px] ${
              "active" in tab && tab.active
                ? "text-ink border-accent"
                : "text-ink-muted border-transparent hover:text-ink"
            }`}
          >
            {t(`tabs.${tab.key}`)}
            <span
              className={`font-mono text-[10px] px-1.5 py-px ${
                "active" in tab && tab.active
                  ? "bg-accent text-white"
                  : "bg-bg-subtle text-ink-muted"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {await Promise.all(
          myListings.map(async (listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))
        )}
      </div>
    </div>
  );
}
