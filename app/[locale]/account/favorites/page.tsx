import { getTranslations } from "next-intl/server";
import { ListingCard } from "@/components/ListingCard";
import { MOCK_LISTINGS } from "@/lib/mock-listings";

export default async function FavoritesPage() {
  const t = await getTranslations("Account.favorites");

  // Mock: pretend listings 1, 2, 5 are favorited
  const favorites = MOCK_LISTINGS.filter((l) =>
    ["1", "2", "5"].includes(l.id)
  );

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="font-sans font-black text-[28px] sm:text-[36px] uppercase tracking-[-0.04em] leading-none text-ink">
          {t("title")}
        </h1>
        <p className="font-sans text-[13px] text-ink-muted mt-2">
          {t("subtitle", { count: favorites.length })}
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {await Promise.all(
          favorites.map(async (listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))
        )}
      </div>
    </div>
  );
}
