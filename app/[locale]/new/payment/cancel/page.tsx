import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { isValidTier } from "@/lib/tiers";

export default async function PaymentCancelPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tier?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const sp = await searchParams;
  const tier = sp?.tier;
  const retryHref =
    tier && isValidTier(tier) && tier !== "free"
      ? `/new/payment?tier=${tier}`
      : "/new";

  const t = await getTranslations("Payment.cancel");

  return (
    <div className="max-w-[640px] w-full mx-auto px-6 py-16 text-center">
      <div className="inline-grid place-items-center w-20 h-20 bg-bg-dark text-white mb-6 mx-auto">
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
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </div>

      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-muted mb-3">
        {t("kicker")}
      </p>
      <h1 className="font-sans font-black text-[36px] sm:text-[48px] uppercase tracking-[-0.04em] leading-none text-ink mb-4">
        {t("title")}
      </h1>
      <p className="font-sans text-[15px] text-ink-muted max-w-md mx-auto leading-relaxed">
        {t("body")}
      </p>

      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href={retryHref}
          className="bg-accent hover:bg-accent-2 text-white font-sans font-extrabold text-[13px] uppercase tracking-[0.13em] px-6 py-3.5 no-underline transition-colors"
        >
          {t("retry")}
        </Link>
        <Link
          href="/new"
          className="bg-white border-[1.5px] border-ink hover:bg-ink hover:text-white text-ink font-sans font-extrabold text-[13px] uppercase tracking-[0.13em] px-6 py-3.5 no-underline transition-colors"
        >
          {t("backToForm")}
        </Link>
      </div>
    </div>
  );
}
