import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const STEPS = ["search", "contact", "verify", "buy"] as const;

export default async function HowItWorksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("HowItWorks");

  return (
    <article className="max-w-[1000px] w-full mx-auto px-6 py-12">
      <header className="mb-12 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent mb-3">
          {t("kicker")}
        </p>
        <h1 className="font-sans font-black text-[48px] sm:text-[64px] uppercase tracking-[-0.04em] leading-[0.95] text-ink mb-4">
          {t("title")}
        </h1>
        <p className="font-sans text-[16px] text-ink-muted leading-[1.55] max-w-[600px] mx-auto">
          {t("subtitle")}
        </p>
      </header>

      {/* 4-step flow */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-12">
        {STEPS.map((key, i) => (
          <div
            key={key}
            className="bg-white border-[1.5px] border-ink p-6 relative"
          >
            <div className="font-mono font-bold text-[10px] uppercase tracking-[0.18em] text-accent mb-2">
              {t("stepLabel", { num: String(i + 1).padStart(2, "0") })}
            </div>
            <div className="font-sans font-black text-[64px] uppercase tracking-[-0.05em] leading-none text-ink absolute top-4 right-5 opacity-10 select-none">
              {String(i + 1).padStart(2, "0")}
            </div>
            <h2 className="font-sans font-extrabold text-[18px] uppercase tracking-[-0.02em] text-ink mb-2">
              {t(`steps.${key}.title`)}
            </h2>
            <p className="font-sans text-[14px] text-ink-muted leading-[1.55]">
              {t(`steps.${key}.body`)}
            </p>
          </div>
        ))}
      </div>

      {/* Final CTA */}
      <div className="text-center">
        <Link
          href="/"
          className="inline-block bg-accent hover:bg-accent-2 text-white font-sans font-extrabold text-[13px] uppercase tracking-[0.13em] px-6 py-4 no-underline transition-colors border-[1.5px] border-ink shadow-[3px_3px_0_var(--ink)] hover:shadow-[6px_6px_0_var(--ink)] hover:-translate-x-[3px] hover:-translate-y-[3px] transition-all"
        >
          {t("finalCta")}
        </Link>
      </div>
    </article>
  );
}
