import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const SECTIONS = [
  {
    key: "account",
    items: ["register", "password", "delete"] as const,
  },
  {
    key: "listings",
    items: ["howPublish", "moderation", "edit", "limits"] as const,
  },
  {
    key: "payments",
    items: ["howTop", "refund", "vat"] as const,
  },
  {
    key: "safety",
    items: ["meetup", "documents", "scam"] as const,
  },
] as const;

export default async function HelpPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Help");

  return (
    <article className="max-w-[900px] w-full mx-auto px-6 py-12">
      <header className="mb-10 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent mb-3">
          {t("kicker")}
        </p>
        <h1 className="font-sans font-black text-[44px] sm:text-[60px] uppercase tracking-[-0.04em] leading-[0.95] text-ink mb-4">
          {t("title")}
        </h1>
        <p className="font-sans text-[16px] text-ink-muted leading-[1.55] max-w-[600px] mx-auto">
          {t("subtitle")}
        </p>
      </header>

      <div className="flex flex-col gap-6 mb-10">
        {SECTIONS.map(({ key: sectionKey, items }) => (
          <section
            key={sectionKey}
            className="bg-white border-[1.5px] border-ink p-5"
          >
            <h2 className="font-sans font-extrabold text-[18px] uppercase tracking-[-0.02em] text-ink mb-4 border-b border-line pb-3">
              {t(`sections.${sectionKey}.title`)}
            </h2>
            <dl className="flex flex-col gap-4 m-0">
              {items.map((itemKey) => (
                <div key={itemKey}>
                  <dt className="font-sans font-bold text-[14px] text-ink mb-1">
                    {t(`sections.${sectionKey}.items.${itemKey}.q`)}
                  </dt>
                  <dd className="font-sans text-[13.5px] text-ink-muted leading-[1.55] m-0">
                    {t(`sections.${sectionKey}.items.${itemKey}.a`)}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>

      {/* Still need help */}
      <section className="bg-bg-subtle border-l-[3px] border-accent p-5 mb-8">
        <h2 className="font-sans font-extrabold text-[18px] uppercase tracking-[-0.02em] text-ink mb-2">
          {t("contact.title")}
        </h2>
        <p className="font-sans text-[14px] text-ink leading-[1.55] mb-3">
          {t("contact.body")}
        </p>
        <a
          href="mailto:help@autodiaspora.com"
          className="font-mono text-[13px] text-accent hover:text-accent-2 no-underline underline decoration-accent decoration-2 underline-offset-[3px]"
        >
          help@autodiaspora.com
        </a>
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
