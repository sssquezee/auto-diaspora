import { notFound } from "next/navigation";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  IMAGE_GRADIENTS,
  MOCK_LISTINGS,
  formatMileage,
  formatPriceEur,
  getListingById,
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
  const tSidebar = await getTranslations("Sidebar");

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

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        {/* LEFT — gallery + content */}
        <div className="flex flex-col gap-3">
          {/* Gallery */}
          <div className="bg-white border-[1.5px] border-ink">
            <div
              className="aspect-[16/10] w-full relative"
              style={{ background: IMAGE_GRADIENTS[listing.imageVariant] }}
            >
              {/* Badges */}
              {listing.badges.length > 0 && (
                <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                  {listing.badges.map((b) => {
                    const labelKey =
                      b === "verified" ? "✓ " + tCard("badges.verified") :
                      b === "top" ? "★ " + tCard("badges.top") :
                      tCard(`badges.${b}`);
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
              )}
              {/* Photo counter */}
              <span className="absolute bottom-3 right-3 bg-ink text-white font-mono font-bold text-[12px] px-2 py-1">
                1 / {listing.photoCount}
              </span>
            </div>
            {/* Thumb strip */}
            <div className="flex gap-1 p-2 border-t-[1.5px] border-ink overflow-x-auto">
              {Array.from({ length: Math.min(8, listing.photoCount) }).map(
                (_, i) => (
                  <div
                    key={i}
                    className={`w-[88px] h-[64px] flex-shrink-0 ${
                      i === 0 ? "outline outline-2 outline-accent outline-offset-[-2px]" : ""
                    }`}
                    style={{ background: IMAGE_GRADIENTS[listing.imageVariant] }}
                  />
                )
              )}
            </div>
          </div>

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
        <aside className="flex flex-col gap-3 lg:sticky lg:top-3.5 lg:h-fit">
          {/* Action card */}
          <div className="bg-white border-[1.5px] border-ink p-4 flex flex-col gap-2">
            <button
              type="button"
              className="w-full bg-accent hover:bg-accent-2 text-white font-sans font-extrabold text-[13px] uppercase tracking-[0.12em] py-3.5 cursor-pointer border-0 transition-colors"
            >
              {t("actions.writeToSeller")}
            </button>
            <button
              type="button"
              className="w-full bg-white text-ink border-[1.5px] border-ink hover:bg-ink hover:text-white font-sans font-extrabold text-[13px] uppercase tracking-[0.12em] py-[10px] cursor-pointer transition-colors"
            >
              {t("actions.showPhone")}
            </button>
            <button
              type="button"
              className="w-full bg-white text-ink border-[1.5px] border-ink hover:bg-ink hover:text-white font-sans font-semibold text-[12px] uppercase tracking-[0.12em] py-[10px] cursor-pointer transition-colors flex items-center justify-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {t("actions.addToFavorites")}
            </button>
          </div>

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
    </div>
  );
}
