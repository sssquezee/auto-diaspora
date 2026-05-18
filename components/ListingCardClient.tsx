"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FavoriteButton } from "./FavoriteButton";
import {
  type Listing,
  type Locale,
  IMAGE_GRADIENTS,
  formatMileage,
  formatPriceEur,
} from "@/lib/mock-listings";

function FuelIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <path d="M3 12h18" />
    </svg>
  );
}
function YearIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}
function TransmissionIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function MileageIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <path d="M5 17h14" />
    </svg>
  );
}
function ElectricIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

type Props = {
  listing: Listing;
  isAuthed: boolean;
  isFavorite: boolean;
};

/** Client mirror of ListingCard for use inside other client components. */
export function ListingCardClient({ listing, isAuthed, isFavorite }: Props) {
  const locale = useLocale() as Locale;
  const t = useTranslations("ListingCard");

  const mileage = formatMileage(listing.mileageKm, locale);
  const price = formatPriceEur(listing.priceEur, locale);
  const mileageShort = `${Math.round(listing.mileageKm / 1000)} ${t("thousand")}`;
  const fuelLabel = t(`fuel.${listing.fuel}`);
  const transmissionLabel = t(`transmission.${listing.transmission}`);

  const baseShadow = listing.premium ? "shadow-[3px_3px_0_var(--accent)]" : "";

  return (
    <article
      className={`relative bg-bg-card border-[1.5px] border-ink overflow-hidden transition-all duration-150 hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-[6px_6px_0_var(--accent)] ${baseShadow}`}
    >
      {listing.premium && (
        <span className="absolute top-2 right-2 z-[3] bg-accent text-white font-mono font-extrabold text-[10px] tracking-[0.12em] px-2 py-[3px] pointer-events-none">
          {t("badges.premium")}
        </span>
      )}

      <FavoriteButton
        listingId={listing.id}
        isAuthed={isAuthed}
        initiallyFavorited={isFavorite}
        label={t("favorite")}
        className={`absolute right-2 z-[3] w-[30px] h-[30px] ${
          listing.premium ? "top-9" : "top-2"
        }`}
      />

      <Link
        href={`/listing/${listing.id}`}
        className="block no-underline text-ink"
      >
        <div
          className="aspect-[4/3] w-full relative border-b-[1.5px] border-ink overflow-hidden"
          style={{ background: IMAGE_GRADIENTS[listing.imageVariant] }}
        >
          {listing.photoUrls?.[0] && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={listing.photoUrls[0]}
              alt={`${listing.brand} ${listing.model}`}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          {listing.badges.length > 0 && (
            <div className="absolute top-2 left-2 flex flex-wrap gap-1">
              {listing.badges.map((b) => {
                const labelKey =
                  b === "verified" ? "✓ " + t("badges.verified") :
                  b === "top" ? "★ " + t("badges.top") :
                  t(`badges.${b}`);
                const variantClass =
                  b === "top"
                    ? "bg-accent text-white"
                    : b === "verified"
                    ? "bg-white text-ink"
                    : b === "new"
                    ? "bg-ink text-accent"
                    : "bg-white text-accent border border-accent";
                return (
                  <span
                    key={b}
                    className={`font-mono font-extrabold text-[10px] tracking-[0.1em] uppercase px-[7px] py-[3px] ${variantClass}`}
                  >
                    {labelKey}
                  </span>
                );
              })}
            </div>
          )}

          <span className="absolute bottom-2 right-2 bg-ink text-white font-mono font-bold text-[11px] px-[7px] py-[2px]">
            {listing.photoCount}
          </span>
        </div>

        <div className="px-3.5 py-3">
          <h3 className="font-sans font-bold text-[14px] text-ink leading-[1.25] tracking-[-0.02em] uppercase line-clamp-1 mb-1">
            {listing.brand} {listing.model}
          </h3>
          <p className="font-mono text-[12px] text-ink-muted mb-2.5">
            {listing.year} · {mileage} км · {listing.engineSpec[locale]}
          </p>

          <div className="flex items-baseline gap-2 mb-2.5 pb-2.5 border-b border-dashed border-line-strong">
            <span className="font-mono font-bold text-[22px] text-ink tracking-[-0.02em]">
              {price}
            </span>
            <span className="font-mono text-[11.5px] text-ink-faded">
              {listing.priceUah}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-2 gap-y-1 mb-2.5">
            <div className="flex items-center gap-[5px] text-[11.5px] text-ink-muted">
              <span className="text-accent">
                {listing.fuel === "electric" ? <ElectricIcon /> : <FuelIcon />}
              </span>
              {fuelLabel}
            </div>
            <div className="flex items-center gap-[5px] text-[11.5px] text-ink-muted">
              <span className="text-accent"><YearIcon /></span>
              {listing.year}
            </div>
            <div className="flex items-center gap-[5px] text-[11.5px] text-ink-muted">
              <span className="text-accent"><TransmissionIcon /></span>
              {transmissionLabel}
            </div>
            <div className="flex items-center gap-[5px] text-[11.5px] text-ink-muted">
              <span className="text-accent"><MileageIcon /></span>
              {mileageShort}
            </div>
          </div>

          <div className="flex justify-between items-center font-mono text-[11px] text-ink-faded">
            <div className="flex items-center gap-[5px] text-ink font-bold uppercase tracking-[0.04em]">
              <span className="bg-ink text-white text-[9px] font-bold px-1 py-px tracking-[0.04em]">
                {listing.country}
              </span>
              {listing.city[locale]}
            </div>
            <span>{listing.postedAt[locale]}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
