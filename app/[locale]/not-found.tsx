import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return (
    <div className="flex-1 grid place-items-center px-6 py-16">
      <div className="max-w-[480px] w-full text-center">
        <div
          aria-hidden
          className="font-mono font-black text-[120px] sm:text-[160px] leading-none tracking-[-0.06em] text-ink mb-4"
        >
          404
        </div>

        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent mb-3">
          {t("kicker")}
        </p>
        <h1 className="font-sans font-black text-[28px] sm:text-[36px] uppercase tracking-[-0.04em] leading-none text-ink mb-3">
          {t("title")}
        </h1>
        <p className="font-sans text-[14px] text-ink-muted leading-relaxed mb-6">
          {t("body")}
        </p>

        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Link
            href="/"
            className="inline-block bg-accent hover:bg-accent-2 text-white font-sans font-extrabold text-[13px] uppercase tracking-[0.13em] px-5 py-3 no-underline transition-colors"
          >
            {t("ctaHome")}
          </Link>
          <Link
            href="/search"
            className="inline-block bg-white border-[1.5px] border-ink hover:bg-ink hover:text-white text-ink font-sans font-extrabold text-[13px] uppercase tracking-[0.13em] px-5 py-3 no-underline transition-colors"
          >
            {t("ctaSearch")}
          </Link>
        </div>
      </div>
    </div>
  );
}
