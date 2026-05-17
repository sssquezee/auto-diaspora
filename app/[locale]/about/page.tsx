import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("About");

  return (
    <article className="max-w-[760px] w-full mx-auto px-6 py-12">
      <header className="mb-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent mb-3">
          {t("kicker")}
        </p>
        <h1 className="font-sans font-black text-[44px] sm:text-[56px] uppercase tracking-[-0.04em] leading-[0.95] text-ink mb-4">
          {t("title")}
        </h1>
        <p className="font-sans text-[16px] text-ink-muted leading-[1.55] max-w-[640px]">
          {t("subtitle")}
        </p>
      </header>

      <section className="mb-8">
        <h2 className="font-sans font-extrabold text-[20px] uppercase tracking-[-0.02em] text-ink mb-3">
          {t("mission.title")}
        </h2>
        <p className="font-sans text-[15px] text-ink leading-[1.7]">
          {t("mission.body")}
        </p>
      </section>

      <section className="mb-8 bg-bg-subtle border-l-[3px] border-accent p-5">
        <h2 className="font-sans font-extrabold text-[20px] uppercase tracking-[-0.02em] text-ink mb-3">
          {t("why.title")}
        </h2>
        <ul className="flex flex-col gap-2.5 list-none p-0 m-0">
          {(["verified", "noFees", "languages", "telegram"] as const).map((k) => (
            <li
              key={k}
              className="flex gap-3 font-sans text-[14.5px] text-ink leading-[1.55]"
            >
              <span className="font-mono font-bold text-accent flex-shrink-0">
                →
              </span>
              {t(`why.items.${k}`)}
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="font-sans font-extrabold text-[20px] uppercase tracking-[-0.02em] text-ink mb-3">
          {t("team.title")}
        </h2>
        <p className="font-sans text-[15px] text-ink leading-[1.7]">
          {t("team.body")}
        </p>
      </section>

      <section className="border-t border-line pt-6 font-mono text-[12px] uppercase tracking-[0.14em] text-ink-muted flex flex-col sm:flex-row gap-3 sm:gap-8">
        <span>
          <span className="text-ink-faded">{t("contact.email")}: </span>
          <a
            href="mailto:hello@autodiaspora.com"
            className="text-ink hover:text-accent no-underline"
          >
            hello@autodiaspora.com
          </a>
        </span>
        <span>
          <span className="text-ink-faded">{t("contact.legal")}: </span>
          <span className="text-ink">eenmanszaak · NL · KVK</span>
        </span>
      </section>
    </article>
  );
}
