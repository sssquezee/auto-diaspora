import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { ListingGrid } from "@/components/ListingGrid";
import {
  getSellerProfile,
  getSellerStats,
  getSellerReviews,
} from "@/lib/reviews";
import { getSellerActiveListings } from "@/lib/listings";
import { getFavoritesState } from "@/lib/favorites-server";

function initialsFrom(name: string | null, fallback: string): string {
  const source = (name && name.trim()) || fallback;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function fmtDateMonthYear(iso: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale === "uk" ? "uk-UA" : locale, {
      year: "numeric",
      month: "long",
    }).format(new Date(iso));
  } catch {
    return new Date(iso).toISOString().slice(0, 7);
  }
}

function StarBar({ rating }: { rating: number }) {
  // Whole + half via two layered rows. Keeps it server-renderable.
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
  return (
    <span
      className="relative inline-block font-mono text-[14px] leading-none"
      aria-hidden
    >
      <span className="text-ink-faded">★★★★★</span>
      <span
        className="absolute left-0 top-0 overflow-hidden text-accent"
        style={{ width: `${pct}%` }}
      >
        ★★★★★
      </span>
    </span>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const profile = await getSellerProfile(id);
  if (!profile) return {};

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const t = await getTranslations({ locale, namespace: "SellerProfile" });
  const name = profile.full_name?.trim() || t("nameFallback");
  const title = t("metaTitle", { name });
  const description = t("metaDescription", { name });

  const languages: Record<string, string> = {};
  for (const l of routing.locales) languages[l] = `${siteUrl}/${l}/u/${id}`;
  languages["x-default"] = `${siteUrl}/${routing.defaultLocale}/u/${id}`;

  return {
    title,
    description,
    alternates: { canonical: `/${locale}/u/${id}`, languages },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/${locale}/u/${id}`,
      locale,
      type: "profile",
    },
  };
}

export default async function SellerProfilePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const profile = await getSellerProfile(id);
  if (!profile) notFound();

  const [stats, listings, reviews, favState] = await Promise.all([
    getSellerStats(id),
    getSellerActiveListings(id, 24),
    getSellerReviews(id, 30),
    getFavoritesState(),
  ]);

  const t = await getTranslations("SellerProfile");
  const displayName = profile.full_name?.trim() || t("nameFallback");
  const initials = initialsFrom(profile.full_name, displayName);
  const memberSince = fmtDateMonthYear(profile.created_at, locale);
  const cityLine = [profile.city, profile.country].filter(Boolean).join(", ");

  return (
    <div className="max-w-[1400px] w-full mx-auto px-6 py-6 flex flex-col gap-6">
      {/* Header */}
      <section className="bg-white border-[1.5px] border-ink p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-accent text-white grid place-items-center font-sans font-black text-[28px] sm:text-[32px] shrink-0">
            {initials}
          </div>
          <div className="flex flex-col gap-2 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-sans font-black text-[28px] sm:text-[36px] uppercase tracking-[-0.04em] leading-none text-ink m-0">
                {displayName}
              </h1>
              {profile.is_verified && (
                <span className="bg-accent text-white font-sans font-bold text-[10px] uppercase tracking-[0.12em] px-2 py-1">
                  {t("badges.verified")}
                </span>
              )}
              {profile.is_dealer && (
                <span className="bg-ink text-white font-sans font-bold text-[10px] uppercase tracking-[0.12em] px-2 py-1">
                  {t("badges.dealer")}
                </span>
              )}
            </div>
            {cityLine && (
              <div className="font-mono text-[12px] text-ink-muted flex items-center gap-1.5">
                {profile.country && (
                  <span className="bg-ink text-white text-[10px] font-bold px-1 py-px tracking-[0.04em]">
                    {profile.country}
                  </span>
                )}
                {profile.city || null}
              </div>
            )}
            <div className="font-mono text-[11px] text-ink-muted uppercase tracking-[0.08em]">
              {t("memberSince", { date: memberSince })}
            </div>

            {/* Stats row */}
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 border-t border-line pt-4">
              <Stat label={t("stats.active")} value={stats.active_listings} />
              <Stat label={t("stats.sold")} value={stats.sold_listings} />
              <Stat
                label={t("stats.reviews")}
                value={stats.review_count}
              />
              <Stat
                label={t("stats.rating")}
                value={
                  stats.avg_rating !== null
                    ? stats.avg_rating.toFixed(1)
                    : "—"
                }
                hint={
                  stats.avg_rating !== null ? (
                    <StarBar rating={stats.avg_rating} />
                  ) : null
                }
              />
            </dl>
          </div>
        </div>
      </section>

      {/* Active listings */}
      <section className="flex flex-col gap-3">
        <header className="flex items-baseline justify-between">
          <h2 className="font-sans font-extrabold text-[16px] uppercase tracking-[0.12em] text-ink m-0">
            {t("sections.listings")}
          </h2>
          <span className="font-mono text-[11px] text-ink-muted">
            {t("listingsCount", { count: stats.active_listings })}
          </span>
        </header>
        {listings.length > 0 ? (
          <ListingGrid
            listings={listings}
            isAuthed={favState.isAuthed}
            favoriteIds={favState.favoriteIds}
          />
        ) : (
          <div className="bg-white border-[1.5px] border-line-strong p-8 text-center font-sans text-[13px] text-ink-muted">
            {t("emptyListings")}
          </div>
        )}
      </section>

      {/* Reviews */}
      <section className="flex flex-col gap-3">
        <header className="flex items-baseline justify-between">
          <h2 className="font-sans font-extrabold text-[16px] uppercase tracking-[0.12em] text-ink m-0">
            {t("sections.reviews")}
          </h2>
          <span className="font-mono text-[11px] text-ink-muted">
            {stats.avg_rating !== null
              ? t("reviewsSummary", {
                  count: stats.review_count,
                  avg: stats.avg_rating.toFixed(1),
                })
              : t("reviewsEmpty")}
          </span>
        </header>

        {reviews.length === 0 ? (
          <div className="bg-white border-[1.5px] border-line-strong p-8 text-center font-sans text-[13px] text-ink-muted">
            {t("emptyReviews")}
          </div>
        ) : (
          <ul className="list-none p-0 m-0 flex flex-col gap-3">
            {reviews.map((r) => {
              const buyerName = r.buyer?.full_name?.trim() ||
                r.buyer?.email?.split("@")[0] ||
                t("buyerFallback");
              const buyerInitials = initialsFrom(r.buyer?.full_name ?? null, buyerName);
              const date = fmtDateMonthYear(r.created_at, locale);
              return (
                <li
                  key={r.id}
                  className="bg-white border-[1.5px] border-line-strong p-4 flex gap-3"
                >
                  <div className="w-10 h-10 bg-ink text-white grid place-items-center font-sans font-black text-[12px] shrink-0">
                    {buyerInitials}
                  </div>
                  <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="font-sans font-bold text-[13px] text-ink">
                        {buyerName}
                      </span>
                      <StarBar rating={r.rating} />
                      <span className="font-mono text-[11px] text-ink-muted">
                        {date}
                      </span>
                    </div>
                    {r.listing && (
                      <Link
                        href={`/listing/${r.listing.id}`}
                        className="font-mono text-[11px] text-ink-muted hover:text-accent no-underline self-start"
                      >
                        {r.listing.brand} {r.listing.model} · {r.listing.year}
                      </Link>
                    )}
                    {r.comment && (
                      <p className="font-sans text-[13px] text-ink leading-relaxed m-0 whitespace-pre-wrap">
                        {r.comment}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | string;
  hint?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted">
        {label}
      </dt>
      <dd className="m-0 flex items-center gap-2">
        <span className="font-sans font-black text-[20px] text-ink leading-none">
          {value}
        </span>
        {hint}
      </dd>
    </div>
  );
}
