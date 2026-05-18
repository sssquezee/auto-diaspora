import { getTranslations } from "next-intl/server";

export default async function AdminReportsPage() {
  const t = await getTranslations("Admin.reports");

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="font-sans font-black text-[28px] sm:text-[36px] uppercase tracking-[-0.04em] leading-none text-ink">
          {t("title")}
        </h1>
        <p className="font-sans text-[13px] text-ink-muted mt-2">
          {t("subtitle")}
        </p>
      </header>
      <div className="bg-white border-[1.5px] border-dashed border-line-strong p-6 font-sans text-[13px] text-ink-muted leading-relaxed">
        {t("placeholder")}
      </div>
    </div>
  );
}
