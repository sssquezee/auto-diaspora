import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const STATS = {
  listings: 2,
  favorites: 3,
  messages: 1,
};

function StatCard({
  href,
  label,
  value,
  cta,
}: {
  href: string;
  label: string;
  value: string | number;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="block bg-white border-[1.5px] border-ink p-5 no-underline text-ink transition-all duration-150 hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-[6px_6px_0_var(--accent)]"
    >
      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">
        {label}
      </div>
      <div className="font-mono font-bold text-[36px] text-ink leading-none tracking-[-0.03em] my-3">
        {value}
      </div>
      <div className="font-sans font-bold text-[12px] uppercase tracking-[0.12em] text-accent">
        {cta}
      </div>
    </Link>
  );
}

export default async function AccountOverviewPage() {
  const t = await getTranslations("Account.overview");
  const tNav = await getTranslations("Account.nav");

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="font-sans font-black text-[36px] sm:text-[44px] uppercase tracking-[-0.04em] leading-none text-ink">
          {t("title", { name: "Олександр" })}
        </h1>
        <p className="font-sans text-[14px] text-ink-muted mt-2">
          {t("subtitle")}
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard
          href="/account/listings"
          label={t("cards.listings")}
          value={STATS.listings}
          cta={tNav("listings") + " →"}
        />
        <StatCard
          href="/account/favorites"
          label={t("cards.favorites")}
          value={STATS.favorites}
          cta={tNav("favorites") + " →"}
        />
        <StatCard
          href="/account/messages"
          label={t("cards.messages")}
          value={STATS.messages}
          cta={tNav("messages") + " →"}
        />
      </div>

      {/* Telegram CTA */}
      <section className="bg-ink text-white border-[1.5px] border-ink p-5 relative overflow-hidden">
        <div
          aria-hidden
          className="absolute -top-12 -right-12 w-[200px] h-[200px] rounded-full opacity-20 pointer-events-none"
          style={{ background: "var(--accent)" }}
        />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="font-sans font-extrabold text-[10.5px] uppercase tracking-[0.18em] text-accent mb-2">
              {t("telegram.label")}
            </div>
            <h2 className="font-sans font-black text-[22px] sm:text-[28px] uppercase tracking-[-0.03em] leading-none mb-2">
              {t("telegram.title")}
            </h2>
            <p className="font-sans text-[13px] text-white/70 max-w-md">
              {t("telegram.desc")}
            </p>
          </div>
          <button
            type="button"
            className="bg-accent hover:bg-accent-2 text-white font-sans font-extrabold text-[12px] uppercase tracking-[0.14em] px-5 py-3 cursor-pointer border-0 transition-colors flex-shrink-0"
          >
            {t("telegram.cta")}
          </button>
        </div>
      </section>
    </div>
  );
}
