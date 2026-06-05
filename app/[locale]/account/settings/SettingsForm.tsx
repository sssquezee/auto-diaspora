"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { updateProfileAction, deleteAccountAction } from "./actions";

const COUNTRIES = [
  "AT", "BE", "BG", "CH", "CZ", "DE", "DK", "EE", "ES", "FI",
  "FR", "GR", "HR", "HU", "IE", "IT", "LT", "LU", "LV", "NL",
  "NO", "PL", "PT", "RO", "SE", "SI", "SK",
] as const;
const LANGUAGES = ["uk", "ru", "en"] as const;

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

type Props = {
  locale: string;
  email: string;
  defaults: {
    full_name: string;
    phone: string;
    country: string;
    city: string;
    language: string;
  };
};

export function SettingsForm({ locale, email, defaults }: Props) {
  const t = useTranslations("Account.settings");
  const tSidebar = useTranslations("Sidebar");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    setSubmitting(true);
    // Native action handles the redirect — no need to await here, just
    // let the form post. setSubmitting reset only matters if validation
    // fails before we leave the page.
    void e;
  };

  const handleDelete = (e: React.FormEvent<HTMLFormElement>) => {
    const ok = window.confirm(t("danger.confirmText"));
    if (!ok) {
      e.preventDefault();
      return;
    }
    setDeleting(true);
  };

  return (
    <div className="flex flex-col gap-4">
      <form
        action={updateProfileAction}
        onSubmit={handleSave}
        className="flex flex-col gap-4"
      >
        <input type="hidden" name="locale" value={locale} />

        {/* Profile */}
        <SectionCard title={t("sections.profile")}>
          <div>
            <FieldLabel>{t("fields.email")}</FieldLabel>
            <input
              type="email"
              value={email}
              disabled
              className={`${fieldClass} bg-bg-subtle text-ink-muted cursor-not-allowed`}
            />
            <p className="font-mono text-[11px] text-ink-faded mt-1.5">
              {t("emailLocked")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel>{t("fields.name")}</FieldLabel>
              <input
                type="text"
                name="full_name"
                defaultValue={defaults.full_name}
                className={fieldClass}
              />
            </div>
            <div>
              <FieldLabel>{t("fields.phone")}</FieldLabel>
              <input
                type="tel"
                name="phone"
                defaultValue={defaults.phone}
                placeholder="+49 170 1234567"
                className={`${fieldClass} font-mono`}
              />
            </div>
            <div>
              <FieldLabel>{t("fields.country")}</FieldLabel>
              <select
                name="country"
                defaultValue={defaults.country}
                className={fieldClass}
              >
                <option value="">—</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {tSidebar(`countries.${c}`)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel>{t("fields.city")}</FieldLabel>
              <input
                type="text"
                name="city"
                defaultValue={defaults.city}
                className={fieldClass}
              />
            </div>
          </div>
        </SectionCard>

        {/* Language */}
        <SectionCard title={t("sections.language")}>
          <div className="grid grid-cols-3 gap-2">
            {LANGUAGES.map((lng) => (
              <label
                key={lng}
                className="flex items-center justify-center gap-2 border-[1.5px] border-line-strong px-3 py-3 cursor-pointer text-[13px] font-sans font-bold uppercase tracking-[0.1em] hover:border-ink"
              >
                <input
                  type="radio"
                  name="language"
                  value={lng}
                  defaultChecked={defaults.language === lng}
                  className="w-3.5 h-3.5 accent-[#0052ff]"
                />
                {lng.toUpperCase()}
              </label>
            ))}
          </div>
          <p className="font-mono text-[11px] text-ink-faded">
            {t("languageHint")}
          </p>
        </SectionCard>

        {/* Save */}
        <button
          type="submit"
          disabled={submitting}
          className={`self-start font-sans font-extrabold text-[13px] uppercase tracking-[0.14em] px-6 py-3 cursor-pointer border-0 transition-colors ${
            submitting
              ? "bg-ink text-white cursor-wait"
              : "bg-accent hover:bg-accent-2 text-white"
          }`}
        >
          {submitting ? t("savingButton") : t("saveButton")}
        </button>
      </form>

      {/* GDPR data export */}
      <SectionCard title={t("sections.dataExport")}>
        <p className="font-sans text-[13px] text-ink-muted leading-relaxed">
          {t("dataExport.desc")}
        </p>
        <a
          href="/api/account/export"
          download
          className="self-start inline-flex items-center gap-2 bg-white border-[1.5px] border-ink hover:bg-ink hover:text-white text-ink font-sans font-extrabold text-[12px] uppercase tracking-[0.13em] px-4 py-2.5 cursor-pointer transition-colors no-underline"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {t("dataExport.cta")}
        </a>
      </SectionCard>

      {/* Danger zone — separate form */}
      <form action={deleteAccountAction} onSubmit={handleDelete}>
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="confirm" value="DELETE" />

        <SectionCard title={t("sections.danger")} danger>
          <p className="font-sans text-[13px] text-ink-muted leading-relaxed">
            {t("danger.desc")}
          </p>
          <button
            type="submit"
            disabled={deleting}
            className={`self-start font-sans font-extrabold text-[12px] uppercase tracking-[0.13em] px-4 py-2.5 cursor-pointer border-[1.5px] transition-colors ${
              deleting
                ? "bg-[#cf222e] border-[#cf222e] text-white cursor-wait"
                : "bg-white border-[#cf222e] hover:bg-[#cf222e] hover:text-white text-[#cf222e]"
            }`}
          >
            {deleting ? t("danger.deleting") : t("danger.cta")}
          </button>
        </SectionCard>
      </form>
    </div>
  );
}
