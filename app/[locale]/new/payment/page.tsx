import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { PayButton } from "@/components/PayButton";
import { TIER_PRICES_EUR, isValidTier, type TierKey } from "@/lib/tiers";
import { isMollieConfigured } from "@/lib/mollie";

export default async function PaymentSummaryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tier?: string; listingId?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const sp = await searchParams;
  const tier = sp?.tier;
  if (!tier || !isValidTier(tier) || tier === "free") notFound();
  const typedTier = tier as Exclude<TierKey, "free">;

  const t = await getTranslations("Payment");
  const tTiers = await getTranslations("NewListing.tiers");
  const mock = !isMollieConfigured();

  const price = TIER_PRICES_EUR[typedTier];

  return (
    <div className="max-w-[640px] w-full mx-auto px-6 py-12">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent mb-3">
        {t("kicker")}
      </p>
      <h1 className="font-sans font-black text-[36px] sm:text-[44px] uppercase tracking-[-0.04em] leading-none text-ink mb-8">
        {t("title")}
      </h1>

      {/* Summary card */}
      <section className="bg-white border-[1.5px] border-ink">
        <header className="border-b border-line px-5 py-3 flex items-center justify-between">
          <span className="font-sans font-extrabold text-[12px] uppercase tracking-[0.13em] text-ink-muted">
            {t("summary.heading")}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faded">
            {t("summary.provider")}
          </span>
        </header>

        <div className="p-5 flex flex-col gap-4">
          <div className="flex justify-between items-baseline gap-4 pb-4 border-b border-dashed border-line-strong">
            <div>
              <div className="font-sans font-extrabold text-[16px] uppercase tracking-[-0.02em] text-ink">
                {tTiers(`${typedTier}.title`)}
              </div>
              <div className="font-sans text-[13px] text-ink-muted mt-1 leading-relaxed">
                {tTiers(`${typedTier}.desc`)}
              </div>
            </div>
            <div className="font-mono font-bold text-[28px] text-ink leading-none tracking-[-0.02em] whitespace-nowrap">
              €{price.toFixed(2)}
            </div>
          </div>

          <dl className="flex flex-col gap-1.5 font-mono text-[12px]">
            <div className="flex justify-between">
              <dt className="text-ink-muted">{t("summary.subtotal")}</dt>
              <dd className="text-ink">€{price.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-muted">{t("summary.vat")}</dt>
              <dd className="text-ink">{t("summary.vatIncluded")}</dd>
            </div>
            <div className="flex justify-between font-bold pt-2 mt-1 border-t border-line">
              <dt className="text-ink uppercase tracking-[0.06em]">{t("summary.total")}</dt>
              <dd className="text-ink">€{price.toFixed(2)}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Mock-mode banner */}
      {mock && (
        <div
          role="note"
          className="bg-accent-soft border-l-[3px] border-accent p-4 mt-4"
        >
          <p className="font-sans text-[13px] text-ink leading-[1.55]">
            <strong className="font-extrabold uppercase tracking-[0.08em] text-[11px] mr-2">
              {t("mock.label")}
            </strong>
            {t("mock.note")}
          </p>
        </div>
      )}

      {/* CTA */}
      <div className="mt-6">
        <PayButton
          tier={typedTier}
          label={t("payCta")}
          pendingLabel={t("payPending")}
          errorLabel={t("payError")}
        />
      </div>

      {/* Methods strip */}
      <div className="mt-6 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faded">
        <span>{t("methods.heading")}:</span>
        <span className="bg-bg-subtle border border-line px-2 py-0.5">iDEAL</span>
        <span className="bg-bg-subtle border border-line px-2 py-0.5">VISA</span>
        <span className="bg-bg-subtle border border-line px-2 py-0.5">Mastercard</span>
        <span className="bg-bg-subtle border border-line px-2 py-0.5">Bancontact</span>
        <span className="bg-bg-subtle border border-line px-2 py-0.5">SEPA</span>
      </div>

      <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
        <Link href="/new" className="no-underline hover:text-accent">
          ← {t("backToForm")}
        </Link>
      </p>
    </div>
  );
}
