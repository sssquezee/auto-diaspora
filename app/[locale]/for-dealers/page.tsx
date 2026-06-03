import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const BENEFITS = ["audience", "fees", "language", "tools"] as const;
const STEPS = ["register", "verify", "publish", "manage"] as const;

export default async function ForDealersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("ForDealers");

  return (
    <article className="max-w-[1000px] w-full mx-auto px-6 py-12">
      <header className="mb-10 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent mb-3">
          {t("kicker")}
        </p>
        <h1 className="font-sans font-black text-[44px] sm:text-[60px] uppercase tracking-[-0.04em] leading-[0.95] text-ink mb-4">
          {t("title")}
        </h1>
        <p className="font-sans text-[16px] text-ink-muted leading-[1.55] max-w-[640px] mx-auto">
          {t("subtitle")}
        </p>
      </header>

      {/* Benefits */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
        {BENEFITS.map((k) => (
          <div
            key={k}
            className="bg-white border-[1.5px] border-ink p-5"
          >
            <h2 className="font-sans font-extrabold text-[16px] uppercase tracking-[-0.02em] text-ink mb-2">
              {t(`benefits.${k}.title`)}
            </h2>
            <p className="font-sans text-[13.5px] text-ink-muted leading-[1.55]">
              {t(`benefits.${k}.body`)}
            </p>
          </div>
        ))}
      </div>

      {/* Pricing note */}
      <section className="bg-bg-subtle border-l-[3px] border-accent p-5 mb-10">
        <h2 className="font-sans font-extrabold text-[18px] uppercase tracking-[-0.02em] text-ink mb-2">
          {t("pricing.title")}
        </h2>
        <p className="font-sans text-[14px] text-ink leading-[1.55] mb-3">
          {t("pricing.body")}
        </p>
        <Link
          href="/pricing"
          className="font-mono text-[12px] uppercase tracking-[0.12em] text-accent hover:text-accent-2 no-underline"
        >
          {t("pricing.linkLabel")} →
        </Link>
      </section>

      {/* Onboarding */}
      <section className="mb-10">
        <h2 className="font-sans font-extrabold text-[20px] uppercase tracking-[-0.02em] text-ink mb-4 text-center">
          {t("steps.title")}
        </h2>
        <ol className="grid grid-cols-1 sm:grid-cols-2 gap-3 list-none p-0 m-0">
          {STEPS.map((k, i) => (
            <li
              key={k}
              className="bg-white border-[1.5px] border-ink p-5 relative"
            >
              <div className="font-mono font-bold text-[10px] uppercase tracking-[0.18em] text-accent mb-1.5">
                {t("stepLabel", { num: String(i + 1).padStart(2, "0") })}
              </div>
              <div className="font-sans font-black text-[56px] uppercase tracking-[-0.05em] leading-none text-ink absolute top-3 right-4 opacity-10 select-none">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="font-sans font-extrabold text-[15px] uppercase tracking-[-0.02em] text-ink mb-1.5">
                {t(`steps.${k}.title`)}
              </h3>
              <p className="font-sans text-[13px] text-ink-muted leading-[1.55]">
                {t(`steps.${k}.body`)}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Contact CTA */}
      <section className="bg-ink text-white border-[1.5px] border-ink p-6 sm:p-8 relative overflow-hidden">
        <div
          aria-hidden
          className="absolute -top-16 -right-16 w-[260px] h-[260px] rounded-full opacity-20 pointer-events-none"
          style={{ background: "var(--accent)" }}
        />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="max-w-[540px]">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-accent mb-2">
              {t("cta.kicker")}
            </p>
            <h2 className="font-sans font-black text-[26px] sm:text-[30px] uppercase tracking-[-0.03em] leading-[0.95] mb-2">
              {t("cta.title")}
            </h2>
            <p className="font-sans text-[14px] text-white/70 leading-[1.55]">
              {t("cta.body")}
            </p>
          </div>
          <Link
            href="/help"
            className="bg-accent hover:bg-accent-2 text-white font-sans font-extrabold text-[12px] uppercase tracking-[0.13em] px-5 py-3 no-underline transition-colors flex-shrink-0"
          >
            {t("cta.button")}
          </Link>
        </div>
      </section>
    </article>
  );
}
