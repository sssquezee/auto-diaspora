import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { TIER_PRICES_EUR, TIER_ORDER, type TierKey } from "@/lib/tiers";

const TIER_FEATURES: Record<TierKey, readonly string[]> = {
  free: ["listing", "photos", "chat", "stats"],
  top: ["pin", "duration", "visibility", "renew"],
  premium_14: ["badge", "autoPin14", "boostViews", "priority"],
  premium_30: ["badge", "autoPin30", "boostViews", "priority"],
};

/** Tier card visual treatment. premium_30 is the headline plan. */
const TIER_STYLE: Record<
  TierKey,
  { highlight: boolean; cta: "secondary" | "primary" }
> = {
  free: { highlight: false, cta: "secondary" },
  top: { highlight: false, cta: "primary" },
  premium_14: { highlight: false, cta: "primary" },
  premium_30: { highlight: true, cta: "primary" },
};

/** Where the CTA goes. Free → /new, paid → /account/listings (pick a listing). */
function ctaHref(tier: TierKey): string {
  return tier === "free" ? "/new" : "/account/listings";
}

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Pricing");

  return (
    <article className="max-w-[1280px] w-full mx-auto px-6 py-12">
      <header className="mb-10 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent mb-3">
          {t("kicker")}
        </p>
        <h1 className="font-sans font-black text-[44px] sm:text-[60px] uppercase tracking-[-0.04em] leading-[0.95] text-ink mb-4">
          {t("title")}
        </h1>
        <p className="font-sans text-[16px] text-ink-muted leading-[1.55] max-w-[680px] mx-auto">
          {t("subtitle")}
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        {TIER_ORDER.map((tier) => {
          const style = TIER_STYLE[tier];
          const price = TIER_PRICES_EUR[tier];
          const highlight = style.highlight;

          return (
            <section
              key={tier}
              className={`border-[1.5px] border-ink p-5 flex flex-col relative overflow-hidden ${
                highlight ? "bg-ink text-white" : "bg-white"
              }`}
            >
              {highlight && (
                <div
                  aria-hidden
                  className="absolute -top-16 -right-16 w-[220px] h-[220px] rounded-full opacity-25 pointer-events-none"
                  style={{ background: "var(--accent)" }}
                />
              )}
              <div className="relative z-10 flex flex-col flex-1">
                {tier === "premium_30" && (
                  <span className="self-start bg-accent text-white font-sans font-bold text-[9px] uppercase tracking-[0.18em] px-2 py-1 mb-3">
                    {t("popular")}
                  </span>
                )}
                <div
                  className={`font-mono text-[10.5px] uppercase tracking-[0.18em] mb-2 ${
                    highlight ? "text-accent" : "text-ink-muted"
                  }`}
                >
                  {t(`tiers.${tier}.kicker`)}
                </div>
                <h2 className="font-sans font-black text-[24px] uppercase tracking-[-0.03em] leading-none mb-2">
                  {t(`tiers.${tier}.title`)}
                </h2>
                <div className="font-sans font-black text-[48px] leading-none mb-1">
                  €{Number.isInteger(price) ? price : price.toFixed(2)}
                </div>
                <p
                  className={`font-mono text-[10.5px] uppercase tracking-[0.12em] mb-5 ${
                    highlight ? "text-white/60" : "text-ink-muted"
                  }`}
                >
                  {t(`tiers.${tier}.priceNote`)}
                </p>

                <ul className="flex flex-col gap-2 list-none p-0 m-0 flex-1 mb-5">
                  {TIER_FEATURES[tier].map((k) => (
                    <li
                      key={k}
                      className={`flex gap-2 font-sans text-[12.5px] leading-[1.5] ${
                        highlight ? "text-white" : "text-ink"
                      }`}
                    >
                      <span className="font-mono font-bold text-accent flex-shrink-0">
                        ✓
                      </span>
                      {t(`tiers.${tier}.features.${k}`)}
                    </li>
                  ))}
                </ul>

                <Link
                  href={ctaHref(tier)}
                  className={`text-center font-sans font-extrabold text-[11.5px] uppercase tracking-[0.13em] px-4 py-3 no-underline transition-colors ${
                    style.cta === "primary"
                      ? "bg-accent hover:bg-accent-2 text-white border-0"
                      : highlight
                      ? "bg-white text-ink hover:bg-ink-muted border-0"
                      : "bg-white border-[1.5px] border-ink hover:bg-ink hover:text-white text-ink"
                  }`}
                >
                  {t(`tiers.${tier}.cta`)}
                </Link>
              </div>
            </section>
          );
        })}
      </div>

      {/* FAQ */}
      <section className="bg-bg-subtle border-l-[3px] border-accent p-5 mb-10 max-w-[860px] mx-auto">
        <h2 className="font-sans font-extrabold text-[18px] uppercase tracking-[-0.02em] text-ink mb-4">
          {t("faq.title")}
        </h2>
        <dl className="flex flex-col gap-4 m-0">
          {(["howTop", "howPremium", "stack", "noBuyerFee", "vat"] as const).map(
            (k) => (
              <div key={k}>
                <dt className="font-sans font-bold text-[14px] text-ink mb-1">
                  {t(`faq.items.${k}.q`)}
                </dt>
                <dd className="font-sans text-[13.5px] text-ink-muted leading-[1.55] m-0">
                  {t(`faq.items.${k}.a`)}
                </dd>
              </div>
            )
          )}
        </dl>
      </section>

      <div className="text-center">
        <Link
          href="/"
          className="inline-block bg-accent hover:bg-accent-2 text-white font-sans font-extrabold text-[13px] uppercase tracking-[0.13em] px-6 py-4 no-underline border-[1.5px] border-ink shadow-[3px_3px_0_var(--ink)] hover:shadow-[6px_6px_0_var(--ink)] hover:-translate-x-[3px] hover:-translate-y-[3px] transition-all"
        >
          {t("finalCta")}
        </Link>
      </div>
    </article>
  );
}
