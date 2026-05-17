import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Hero");

  return (
    <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 relative overflow-hidden">
      {/* Diagonal stripes hero detail */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, transparent 0 24px, var(--ink) 24px 25px)",
        }}
      />

      {/* Cobalt accent circle */}
      <div
        aria-hidden
        className="absolute -top-20 -right-20 w-[300px] h-[300px] rounded-full opacity-[0.18] pointer-events-none"
        style={{ background: "var(--accent)" }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8 text-center max-w-3xl">
        <h1 className="font-sans font-black uppercase leading-none tracking-[-0.05em] text-4xl sm:text-6xl md:text-7xl">
          {t("comingSoon")}
        </h1>

        <p className="font-sans font-medium text-base sm:text-lg text-ink-muted max-w-xl">
          {t("tagline")}
        </p>

        <div className="font-mono text-[11px] uppercase tracking-[0.2em] flex items-center gap-3">
          <span className="bg-bg-dark text-white px-3 py-1.5">
            {t("dayLabel")}
          </span>
          <span className="text-ink-muted">{t("daySubtitle")}</span>
        </div>
      </div>
    </section>
  );
}
