import { getTranslations, setRequestLocale } from "next-intl/server";

const SECTIONS = [
  "account",
  "listings",
  "premium",
  "transactions",
  "prohibited",
  "termination",
  "liability",
  "disputes",
  "changes",
] as const;

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Terms");

  return (
    <article className="max-w-[760px] w-full mx-auto px-6 py-12">
      <header className="mb-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent mb-3">
          {t("kicker")}
        </p>
        <h1 className="font-sans font-black text-[40px] sm:text-[52px] uppercase tracking-[-0.04em] leading-[0.95] text-ink mb-2">
          {t("title")}
        </h1>
        <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-ink-muted">
          {t("lastUpdated")}
        </p>
      </header>

      <p className="font-sans text-[14.5px] text-ink leading-[1.7] mb-3">
        {t("intro")}
      </p>
      <p className="font-mono text-[11px] text-ink-muted leading-relaxed mb-8">
        {t("operatorNote")}
      </p>

      <div className="flex flex-col gap-7">
        {SECTIONS.map((key, i) => (
          <section key={key}>
            <h2 className="font-sans font-extrabold text-[18px] uppercase tracking-[-0.02em] text-ink mb-2 flex items-baseline gap-3">
              <span className="font-mono font-bold text-[14px] text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              {t(`sections.${key}.title`)}
            </h2>
            <p className="font-sans text-[14.5px] text-ink leading-[1.7]">
              {t(`sections.${key}.body`)}
            </p>
          </section>
        ))}
      </div>
    </article>
  );
}
