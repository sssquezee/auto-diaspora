import { getTranslations } from "next-intl/server";

// Mock counts — will come from Supabase aggregates after Day 1
const MOCK_STATS = {
  cars: "6,842",
  sellers: "2,156",
  countries: "14",
  fee: "€0",
};

export async function Hero() {
  const t = await getTranslations("Hero");

  return (
    <section className="relative overflow-hidden bg-ink text-white border-[1.5px] border-ink p-8">
      {/* Diagonal stripes on right half */}
      <div
        aria-hidden
        className="absolute inset-y-0 right-0 w-1/2 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, transparent 0 12px, rgba(255,255,255,0.025) 12px 13px)",
        }}
      />
      {/* Cobalt accent circle */}
      <div
        aria-hidden
        className="absolute -top-24 -right-24 w-[300px] h-[300px] rounded-full opacity-[0.18] pointer-events-none"
        style={{ background: "var(--accent)" }}
      />

      <div className="relative z-10 max-w-[60%]">
        {/* Live badge */}
        <span className="inline-flex items-center gap-[7px] bg-accent text-white text-[10.5px] font-extrabold uppercase tracking-[0.12em] px-2.5 py-1 mb-4">
          <span
            aria-hidden
            className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"
          />
          {t("liveBadge", { count: MOCK_STATS.cars })}
        </span>

        {/* H1 */}
        <h1 className="font-sans font-black uppercase leading-none tracking-[-0.04em] text-[44px] mb-3.5">
          {t("headline")}
          <br />
          <span className="text-accent">{t("headlineAccent")}</span>
        </h1>

        {/* Tagline */}
        <p className="text-[14px] leading-[1.5] max-w-[90%] text-white/75">
          {t("tagline")}
        </p>

        {/* Stats row */}
        <div className="relative z-10 flex flex-wrap gap-10 mt-[26px] pt-[22px] border-t border-white/10">
          {(["cars", "sellers", "countries", "fee"] as const).map((key) => (
            <div key={key}>
              <div className="font-mono font-bold text-[28px] leading-none tracking-[-0.03em] text-white">
                {MOCK_STATS[key]}
              </div>
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/60 mt-[7px]">
                {t(`stats.${key}`)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
