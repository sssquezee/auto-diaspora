import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { isValidTier, type TierKey } from "@/lib/tiers";

export default async function PaymentSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tier?: string; simulated?: string; pid?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const sp = await searchParams;
  const tier = sp?.tier;
  if (!tier || !isValidTier(tier) || tier === "free") notFound();
  const typedTier = tier as Exclude<TierKey, "free">;
  const simulated = sp?.simulated === "1";

  const t = await getTranslations("Payment.success");
  const tTiers = await getTranslations("NewListing.tiers");

  return (
    <div className="max-w-[640px] w-full mx-auto px-6 py-16 text-center">
      {/* Checkmark in cobalt block */}
      <div className="inline-grid place-items-center w-20 h-20 bg-accent text-white mb-6 mx-auto">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent mb-3">
        {t("kicker")}
      </p>
      <h1 className="font-sans font-black text-[36px] sm:text-[48px] uppercase tracking-[-0.04em] leading-none text-ink mb-4">
        {t("title")}
      </h1>
      <p className="font-sans text-[15px] text-ink-muted max-w-md mx-auto leading-relaxed">
        {t("body", { tier: tTiers(`${typedTier}.title`) })}
      </p>

      {simulated && (
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faded">
          {t("simulatedNote")}
        </p>
      )}

      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/account/listings"
          className="bg-accent hover:bg-accent-2 text-white font-sans font-extrabold text-[13px] uppercase tracking-[0.13em] px-6 py-3.5 no-underline transition-colors"
        >
          {t("viewListings")}
        </Link>
        <Link
          href="/"
          className="bg-white border-[1.5px] border-ink hover:bg-ink hover:text-white text-ink font-sans font-extrabold text-[13px] uppercase tracking-[0.13em] px-6 py-3.5 no-underline transition-colors"
        >
          {t("backToCatalog")}
        </Link>
      </div>
    </div>
  );
}
