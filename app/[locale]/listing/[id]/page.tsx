import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ListingGallery } from "@/components/ListingGallery";
import { ListingActions } from "@/components/ListingActions";
import { ListingCard } from "@/components/ListingCard";
import {
  MOCK_LISTINGS,
  formatMileage,
  formatPriceEur,
  getListingById,
  getMockPhone,
  getPhotoGradients,
  getSimilarListings,
  type Listing,
  type Locale,
} from "@/lib/mock-listings";

export function generateStaticParams() {
  return MOCK_LISTINGS.map((l) => ({ id: l.id }));
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: localeParam, id } = await params;
  setRequestLocale(localeParam);
  const locale = localeParam as Locale;

  const listing = getListingById(id);
  if (!listing) notFound();

  const t = await getTranslations("ListingDetail");
  const tCard = await getTranslations("ListingCard");

  const price = formatPriceEur(listing.priceEur, locale);
  const mileage = formatMileage(listing.mileageKm, locale);
  const views = formatMileage(listing.details.views, locale);
  const favorites = formatMileage(listing.details.favorites, locale);
  const sellerInitials = listing.details.seller.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Build specs rows
  const specs: Array<{ label: string; value: React.ReactNode }> = [
    { label: t("specs.year"), value: listing.year },
    { label: t("specs.mileage"), value: `${mileage} ${t("kmUnit")}` },
    { label: t("specs.fuel"), value: tCard(`fuel.${listing.fuel}`) },
    {
      label: t("specs.engine"),
      value:
        listing.details.engineVolumeL !== undefined
          ? `${listing.details.engineVolumeL} L · ${listing.engineSpec[locale]}`
          : listing.engineSpec[locale],
    },
    { label: t("specs.power"), value: `${listing.details.powerHp} ${t("powerUnit")}` },
    { label: t("specs.transmission"), value: tCard(`transmission.${listing.transmission}`) },
    { label: t("specs.bodyType"), value: t(`bodyType.${listing.details.bodyType}`) },
    { label: t("specs.driveType"), value: t(`driveType.${listing.details.driveType}`) },
    { label: t("specs.color"), value: listing.details.color[locale] },
    {
      label: t("specs.customs"),
      value: listing.details.customsCleared
        ? t("specs.customsYes")
        : t("specs.customsNo"),
    },
    {
      label: t("specs.location"),
      value: (
        <span className="inline-flex items-center gap-1.5">
          <span className="bg-ink text-white font-mono text-[10px] font-bold px-1 py-px tracking-[0.04em]">
            {listing.country}
          </span>
          {listing.city[locale]}
        </span>
      ),
    },
  ];

  return (
    <div className="max-w-[1400px] w-full mx-auto px-6 py-6">
      {/* Breadcrumb */}
      <nav className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted mb-4 flex items-center gap-1">
        <Link href="/" className="hover:text-accent no-underline">
          {t("breadcrumb.home")}
        </Link>
        <span>/</span>
        <Link href="/" className="hover:text-accent no-underline">
          {t("breadcrumb.catalog")}
        </Link>
        <span>/</span>
        <span className="text-ink">{listing.brand} {listing.model}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_320px] gap-5">
        {/* LEFT — gallery + content */}
        <div className="flex flex-col gap-3">
          {/* Gallery */}
          <ListingGallery
            gradients={getPhotoGradients(listing.imageVariant, listing.photoCount)}
            prevLabel={t("gallery.prev")}
            nextLabel={t("gallery.next")}
            thumbLabel={t("gallery.thumb")}
            badges={
              listing.badges.length > 0 ? (
                <div className="absolute top-3 left-3 flex flex-wrap gap-1 z-[2]">
                  {listing.badges.map((b) => {
                    const labelKey =
                      b === "verified"
                        ? "✓ " + tCard("badges.verified")
                        : b === "top"
                        ? "★ " + tCard("badges.top")
                        : tCard(`badges.${b}`);
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
                        className={`font-mono font-extrabold text-[10px] tracking-[0.1em] uppercase px-2 py-[3px] ${variantClass}`}
                      >
                        {labelKey}
                      </span>
                    );
                  })}
                </div>
              ) : null
            }
          />

          {/* Title + Price */}
          <div className="bg-white border-[1.5px] border-ink p-5 flex flex-wrap justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="font-sans font-black text-[32px] sm:text-[40px] uppercase tracking-[-0.04em] leading-[1.05] text-ink">
                {listing.brand} {listing.model}
              </h1>
              <p className="font-mono text-[13px] text-ink-muted mt-2">
                {listing.year} · {mileage} {t("kmUnit")} · {listing.engineSpec[locale]} · {tCard(`transmission.${listing.transmission}`)}
              </p>
            </div>
            <div className="text-right">
              <div className="font-mono font-bold text-[32px] text-ink tracking-[-0.02em]">
                {price}
              </div>
              <div className="font-mono text-[13px] text-ink-faded">
                {listing.priceUah}
              </div>
            </div>
          </div>

          {/* Specs */}
          <section className="bg-white border-[1.5px] border-ink p-5">
            <h2 className="font-sans font-extrabold text-[14px] uppercase tracking-[0.12em] text-ink mb-4 pb-3 border-b border-line">
              {t("specsTitle")}
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5">
              {specs.map((s) => (
                <div key={s.label} className="flex justify-between items-center gap-3 border-b border-dashed border-line py-1.5">
                  <dt className="font-sans text-[13px] text-ink-muted">{s.label}</dt>
                  <dd className="font-sans font-semibold text-[13px] text-ink text-right">
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Description */}
          <section className="bg-white border-[1.5px] border-ink p-5">
            <h2 className="font-sans font-extrabold text-[14px] uppercase tracking-[0.12em] text-ink mb-4 pb-3 border-b border-line">
              {t("descriptionTitle")}
            </h2>
            <p className="font-sans text-[14px] text-ink leading-[1.6] whitespace-pre-line">
              {listing.details.description[locale]}
            </p>
          </section>

          {/* Stats / footer */}
          <div className="flex gap-6 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted px-1">
            <span>
              <strong className="text-ink font-bold">{views}</strong>{" "}
              {t("stats.views")}
            </span>
            <span>
              <strong className="text-ink font-bold">{favorites}</strong>{" "}
              {t("stats.favorites")}
            </span>
            <span className="ml-auto">
              <button
                type="button"
                className="bg-transparent text-ink-muted hover:text-accent cursor-pointer border-0 underline decoration-line decoration-1 underline-offset-2"
              >
                {t("actions.report")}
              </button>
            </span>
          </div>
        </div>

        {/* RIGHT — actions + seller (sticky on desktop) */}
        <aside className="flex flex-col gap-3 md:sticky md:top-3.5 md:h-fit">
          {/* Action card */}
          <ListingActions
            listingId={listing.id}
            phone={getMockPhone(listing)}
            writeLabel={t("actions.writeToSeller")}
            showPhoneLabel={t("actions.showPhone")}
            addFavLabel={t("actions.addToFavorites")}
            removeFavLabel={t("actions.removeFromFavorites")}
          />

          {/* Seller card */}
          <div className="bg-white border-[1.5px] border-ink p-4">
            <h3 className="font-sans font-extrabold text-[11px] uppercase tracking-[0.16em] text-ink-muted mb-3">
              {t("sellerTitle")}
            </h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-accent text-white grid place-items-center font-sans font-black text-[16px]">
                {sellerInitials}
              </div>
              <div className="min-w-0">
                <div className="font-sans font-bold text-[14px] text-ink leading-tight">
                  {listing.details.seller.name}
                </div>
                <div className="font-mono text-[11px] text-ink-muted mt-0.5 flex items-center gap-1.5">
                  <span className="bg-ink text-white text-[9px] font-bold px-1 py-px tracking-[0.04em]">
                    {listing.country}
                  </span>
                  {listing.city[locale]}
                </div>
              </div>
            </div>

            <dl className="flex flex-col gap-1.5 border-t border-line pt-3 text-[12px]">
              <div className="flex justify-between font-mono text-ink-muted">
                <dt>{t("seller.memberSince", { year: listing.details.seller.memberSinceYear })}</dt>
              </div>
              <div className="flex justify-between font-mono">
                <dt className="text-ink-muted">
                  {t("seller.listingsCount", { count: listing.details.seller.listingsCount })}
                </dt>
              </div>
              {listing.details.seller.verified && (
                <div className="font-mono text-accent font-bold">
                  {t("seller.verified")}
                </div>
              )}
            </dl>

            <button
              type="button"
              className="mt-3 w-full text-left bg-transparent text-ink hover:text-accent font-sans font-semibold text-[12px] uppercase tracking-[0.12em] cursor-pointer border-0 pt-3 border-t border-line"
            >
              {t("seller.viewProfile")}
            </button>
          </div>
        </aside>
      </div>

      {/* Similar listings */}
      <SimilarListings listing={listing} />
    </div>
  );
}

async function SimilarListings({ listing }: { listing: Listing }) {
  const t = await getTranslations("ListingDetail.similar");
  const similar = getSimilarListings(listing, 4);
  if (similar.length === 0) return null;

  return (
    <section className="mt-10 pt-8 border-t-[1.5px] border-ink">
      <div className="flex items-baseline justify-between mb-5 gap-4">
        <h2 className="font-sans font-black text-[22px] sm:text-[28px] uppercase tracking-[-0.03em] text-ink">
          <span className="border-b-[3px] border-accent pb-1">
            {t("title")}
          </span>
        </h2>
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
          {t("subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
        {await Promise.all(
          similar.map((l) => <ListingCard key={l.id} listing={l} />)
        )}
      </div>
    </section>
  );
}
