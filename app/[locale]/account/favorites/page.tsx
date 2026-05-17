"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useFavorites } from "@/hooks/useFavorites";
import { ListingCardClient } from "@/components/ListingCardClient";
import { getListingsByIds } from "@/lib/mock-listings";

export default function FavoritesPage() {
  const t = useTranslations("Account.favorites");
  const { favorites, hydrated } = useFavorites();

  // During SSR + initial hydration, render an empty list (no flicker).
  const listings = hydrated ? getListingsByIds(favorites) : [];

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="font-sans font-black text-[28px] sm:text-[36px] uppercase tracking-[-0.04em] leading-none text-ink">
          {t("title")}
        </h1>
        <p className="font-sans text-[13px] text-ink-muted mt-2">
          {t("subtitle", { count: listings.length })}
        </p>
      </header>

      {!hydrated ? (
        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-muted px-6 py-12 text-center">
          …
        </div>
      ) : listings.length === 0 ? (
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
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <p className="font-sans text-[14px] text-ink-muted max-w-md mx-auto mb-5 leading-relaxed">
            {t("emptyDesc")}
          </p>
          <Link
            href="/"
            className="inline-block bg-accent hover:bg-accent-2 text-white font-sans font-extrabold text-[12px] uppercase tracking-[0.13em] px-5 py-3 no-underline transition-colors"
          >
            {t("emptyCta")}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {listings.map((listing) => (
            <ListingCardClient key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
