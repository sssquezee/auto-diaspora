"use client";

import { useTranslations } from "next-intl";

const fieldClass =
  "w-full border-[1.5px] border-line-strong bg-white px-3 py-2.5 font-sans text-[14px] text-ink outline-none focus:border-ink focus:border-2 focus:px-[11px] focus:py-[9px]";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block font-sans font-bold text-[10.5px] uppercase tracking-[0.1em] text-ink-muted mb-1.5">
      {children}
    </label>
  );
}

function SectionCard({
  title,
  children,
  danger = false,
}: {
  title: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <section
      className={`bg-white border-[1.5px] ${
        danger ? "border-[#cf222e]" : "border-ink"
      }`}
    >
      <header
        className={`px-5 py-3 border-b ${
          danger ? "border-[#cf222e]/30 bg-[#cf222e]/5" : "border-line"
        }`}
      >
        <h2
          className={`font-sans font-extrabold text-[14px] uppercase tracking-[0.12em] ${
            danger ? "text-[#cf222e]" : "text-ink"
          }`}
        >
          {title}
        </h2>
      </header>
      <div className="p-5 flex flex-col gap-4">{children}</div>
    </section>
  );
}

export default function SettingsPage() {
  const t = useTranslations("Account.settings");

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="font-sans font-black text-[28px] sm:text-[36px] uppercase tracking-[-0.04em] leading-none text-ink">
          {t("title")}
        </h1>
      </header>

      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex flex-col gap-4"
      >
        {/* Profile */}
        <SectionCard title={t("sections.profile")}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-accent text-white grid place-items-center font-sans font-black text-[20px] flex-shrink-0">
              ОК
            </div>
            <button
              type="button"
              className="bg-white border-[1.5px] border-ink hover:bg-ink hover:text-white text-ink font-sans font-bold text-[12px] uppercase tracking-[0.1em] px-4 py-2 cursor-pointer transition-colors"
            >
              {t("changeAvatar")}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel>{t("fields.name")}</FieldLabel>
              <input
                type="text"
                defaultValue="Олександр К."
                className={fieldClass}
              />
            </div>
            <div>
              <FieldLabel>{t("fields.phone")}</FieldLabel>
              <input
                type="tel"
                defaultValue="+49 170 1234567"
                className={`${fieldClass} font-mono`}
              />
            </div>
          </div>
        </SectionCard>

        {/* Telegram */}
        <SectionCard title={t("sections.telegram")}>
          <p className="font-sans text-[13px] text-ink-muted leading-relaxed">
            {t("telegram.desc")}
          </p>
          <button
            type="button"
            className="self-start bg-ink hover:bg-accent text-white font-sans font-extrabold text-[12px] uppercase tracking-[0.13em] px-4 py-2.5 cursor-pointer border-0 transition-colors"
          >
            {t("telegram.cta")}
          </button>
        </SectionCard>

        {/* Notifications */}
        <SectionCard title={t("sections.notifications")}>
          {[
            { key: "newMessages", defaultChecked: true },
            { key: "newOnSavedSearch", defaultChecked: true },
            { key: "priceDrops", defaultChecked: false },
            { key: "weekly", defaultChecked: false },
          ].map((row) => (
            <label
              key={row.key}
              className="flex items-center justify-between gap-3 py-1.5 cursor-pointer"
            >
              <span className="font-sans text-[13px] text-ink">
                {t(`notifications.${row.key}`)}
              </span>
              <input
                type="checkbox"
                defaultChecked={row.defaultChecked}
                className="w-4 h-4 accent-[#0052ff]"
              />
            </label>
          ))}
        </SectionCard>

        {/* Language */}
        <SectionCard title={t("sections.language")}>
          <div className="grid grid-cols-3 gap-2">
            {(["uk", "ru", "en"] as const).map((lng, i) => (
              <label
                key={lng}
                className="flex items-center justify-center gap-2 border-[1.5px] border-line-strong px-3 py-3 cursor-pointer text-[13px] font-sans font-bold uppercase tracking-[0.1em] hover:border-ink"
              >
                <input
                  type="radio"
                  name="language"
                  value={lng}
                  defaultChecked={i === 0}
                  className="w-3.5 h-3.5 accent-[#0052ff]"
                />
                {lng.toUpperCase()}
              </label>
            ))}
          </div>
        </SectionCard>

        {/* Save */}
        <button
          type="submit"
          className="self-start bg-accent hover:bg-accent-2 text-white font-sans font-extrabold text-[13px] uppercase tracking-[0.14em] px-6 py-3 cursor-pointer border-0 transition-colors"
        >
          {t("saveButton")}
        </button>

        {/* Danger zone */}
        <SectionCard title={t("sections.danger")} danger>
          <p className="font-sans text-[13px] text-ink-muted leading-relaxed">
            {t("danger.desc")}
          </p>
          <button
            type="button"
            className="self-start bg-white border-[1.5px] border-[#cf222e] hover:bg-[#cf222e] hover:text-white text-[#cf222e] font-sans font-extrabold text-[12px] uppercase tracking-[0.13em] px-4 py-2.5 cursor-pointer transition-colors"
          >
            {t("danger.cta")}
          </button>
        </SectionCard>
      </form>
    </div>
  );
}
