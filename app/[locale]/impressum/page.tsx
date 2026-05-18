import { getTranslations, setRequestLocale } from "next-intl/server";

const BLOCKS = [
  {
    key: "operator" as const,
    rows: ["name", "form", "address"] as const,
  },
  {
    key: "registry" as const,
    rows: ["kvk", "btw"] as const,
  },
  {
    key: "contact" as const,
    rows: ["email", "privacy", "phone"] as const,
  },
];

export default async function ImpressumPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Impressum");

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

      <p className="font-sans text-[14.5px] text-ink leading-[1.7] mb-8">
        {t("intro")}
      </p>

      <div className="flex flex-col gap-7">
        {BLOCKS.map((block) => (
          <section key={block.key} className="bg-white border-[1.5px] border-ink p-5">
            <h2 className="font-sans font-extrabold text-[14px] uppercase tracking-[0.12em] text-ink mb-3 pb-3 border-b border-line">
              {t(`${block.key}.title`)}
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-x-6 gap-y-2 font-sans text-[14px] text-ink">
              {block.rows.map((row) => (
                <div key={row} className="contents">
                  <dt className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted self-baseline">
                    {t(`${block.key}.${row}`)}
                  </dt>
                  <dd className="self-baseline break-words">
                    {t(`${block.key}.${row}Value`)}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}

        <section>
          <h2 className="font-sans font-extrabold text-[18px] uppercase tracking-[-0.02em] text-ink mb-2">
            {t("dispute.title")}
          </h2>
          <p className="font-sans text-[14.5px] text-ink leading-[1.7]">
            {t("dispute.body")}
          </p>
        </section>

        <section>
          <h2 className="font-sans font-extrabold text-[18px] uppercase tracking-[-0.02em] text-ink mb-2">
            {t("liability.title")}
          </h2>
          <p className="font-sans text-[14.5px] text-ink leading-[1.7]">
            {t("liability.body")}
          </p>
        </section>
      </div>
    </article>
  );
}
