"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { BRANDS, getModelsForBrand } from "@/lib/brands";

const COUNTRIES = [
  "AT", "BE", "BG", "CH", "CZ", "DE", "DK", "EE", "ES", "FI",
  "FR", "GR", "HR", "HU", "IE", "IT", "LT", "LU", "LV", "NL",
  "NO", "PL", "PT", "RO", "SE", "SI", "SK",
] as const;

// Year picker options — newest first. Upper bound is "next year" to allow
// brand-new model-year cars (matches the DB check constraint).
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from(
  { length: CURRENT_YEAR + 1 - 1990 + 1 },
  (_, i) => CURRENT_YEAR + 1 - i
);

const fieldClass =
  "w-full border-[1.5px] border-line-strong bg-white px-3 py-2.5 font-sans text-[14px] text-ink outline-none focus:border-ink focus:border-2 focus:px-[11px] focus:py-[9px]";

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-3">
      <label className="font-sans font-bold text-[10.5px] uppercase tracking-[0.1em] text-ink-muted">
        {children}
      </label>
      {hint && <span className="font-mono text-[10px] text-ink-faded">{hint}</span>}
    </div>
  );
}

function SectionCard({
  index,
  title,
  children,
}: {
  index: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white border-[1.5px] border-ink">
      <header className="flex items-center gap-3 border-b border-line px-5 py-3">
        <span className="bg-ink text-white font-mono font-bold text-[12px] w-7 h-7 grid place-items-center">
          {String(index).padStart(2, "0")}
        </span>
        <h2 className="font-sans font-extrabold text-[14px] uppercase tracking-[0.12em] text-ink">
          {title}
        </h2>
      </header>
      <div className="p-5 flex flex-col gap-4">{children}</div>
    </section>
  );
}

export type ListingDefaults = {
  brand?: string;
  model?: string;
  year?: number;
  mileage?: number;
  fuel_type?: string;
  transmission?: string;
  body_type?: string;
  drive_type?: string;
  engine_volume?: number | null;
  power_hp?: number | null;
  color?: string | null;
  vin?: string | null;
  country?: string;
  city?: string;
  condition?: string;
  customs?: "yes" | "no";
  price?: number;
  price_negotiable?: boolean;
  description?: string | null;
};

export function ListingFormBody({ defaults = {} }: { defaults?: ListingDefaults }) {
  const t = useTranslations("NewListing");
  const tListing = useTranslations("ListingCard");
  const tDetail = useTranslations("ListingDetail");
  const tSidebar = useTranslations("Sidebar");

  const [brand, setBrand] = useState(defaults.brand ?? "");
  const [model, setModel] = useState(defaults.model ?? "");

  // Optional fields live in a collapsed block so the form looks short and
  // unintimidating. Auto-expand if a draft already filled any of them.
  const hasDetails =
    defaults.body_type != null ||
    defaults.drive_type != null ||
    defaults.engine_volume != null ||
    defaults.power_hp != null ||
    (defaults.color ?? "") !== "" ||
    (defaults.vin ?? "") !== "" ||
    (defaults.description ?? "") !== "";
  const [showDetails, setShowDetails] = useState(hasDetails);

  const customsDefault = defaults.customs ?? "no";
  const conditionDefault = defaults.condition ?? "used";

  return (
    <>
      {/* 1. Vehicle essentials (all required — these are NOT NULL in the DB) */}
      <SectionCard index={1} title={t("sections.vehicle")}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel>{t("fields.brand")}</FieldLabel>
            <select
              name="brand"
              value={brand}
              onChange={(e) => {
                setBrand(e.target.value);
                setModel("");
              }}
              className={fieldClass}
              required
            >
              <option value="" disabled>
                {tSidebar("placeholders.anyBrand")}
              </option>
              {BRANDS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div>
            <FieldLabel>{t("fields.model")}</FieldLabel>
            <select
              name="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className={`${fieldClass} disabled:cursor-not-allowed disabled:text-ink-faded`}
              disabled={!brand}
              required={!!brand}
            >
              <option value="" disabled>
                {tSidebar("placeholders.anyModel")}
              </option>
              {getModelsForBrand(brand).map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <FieldLabel>{t("fields.year")}</FieldLabel>
            <select
              name="year"
              defaultValue={defaults.year ?? ""}
              className={fieldClass}
              required
            >
              <option value="" disabled>
                —
              </option>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div>
            <FieldLabel>{t("fields.mileage")}</FieldLabel>
            <input
              name="mileage"
              type="number"
              inputMode="numeric"
              min={0}
              defaultValue={defaults.mileage ?? ""}
              placeholder="87 000"
              className={fieldClass}
              required
            />
          </div>
          <div>
            <FieldLabel>{t("fields.fuel")}</FieldLabel>
            <select
              name="fuel_type"
              defaultValue={defaults.fuel_type ?? ""}
              className={fieldClass}
              required
            >
              <option value="" disabled>
                —
              </option>
              {(["diesel", "petrol", "hybrid", "electric"] as const).map((k) => (
                <option key={k} value={k}>
                  {tListing(`fuel.${k}`)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <FieldLabel>{t("fields.transmission")}</FieldLabel>
            <select
              name="transmission"
              defaultValue={defaults.transmission ?? ""}
              className={fieldClass}
              required
            >
              <option value="" disabled>
                —
              </option>
              {(["auto", "manual"] as const).map((k) => (
                <option key={k} value={k}>
                  {tListing(`transmission.${k}`)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </SectionCard>

      {/* 2. Location & price (all required — NOT NULL in the DB) */}
      <SectionCard index={2} title={t("sections.locationPrice")}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel>{t("fields.country")}</FieldLabel>
            <select
              name="country"
              defaultValue={defaults.country ?? ""}
              className={fieldClass}
              required
            >
              <option value="" disabled>
                —
              </option>
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
              name="city"
              type="text"
              defaultValue={defaults.city ?? ""}
              placeholder=""
              className={fieldClass}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-end">
          <div>
            <FieldLabel>{t("fields.price")}</FieldLabel>
            <input
              name="price"
              type="number"
              inputMode="numeric"
              min={0}
              defaultValue={defaults.price ?? ""}
              placeholder="14 500"
              className={fieldClass}
              required
            />
          </div>
          <label className="flex items-center gap-2 text-[13px] cursor-pointer pb-3 self-end">
            <input
              name="price_negotiable"
              type="checkbox"
              defaultChecked={defaults.price_negotiable === true}
              className="w-3.5 h-3.5 accent-[#0052ff]"
            />
            {t("fields.negotiable")}
          </label>
        </div>
      </SectionCard>

      {/* Optional details — collapsed by default. Inputs stay mounted (just
          visually hidden) so values persist and still submit when toggled. */}
      <section className="bg-white border-[1.5px] border-line-strong">
        <button
          type="button"
          onClick={() => setShowDetails((v) => !v)}
          aria-expanded={showDetails}
          className="w-full flex items-center justify-between gap-3 px-5 py-3.5 cursor-pointer text-left hover:bg-bg-subtle transition-colors"
        >
          <span className="flex flex-col">
            <span className="font-sans font-extrabold text-[13px] uppercase tracking-[0.1em] text-ink">
              {t("detailsToggle")}
            </span>
            <span className="font-mono text-[11px] text-ink-faded mt-0.5">
              {t("detailsHint")}
            </span>
          </span>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className={`shrink-0 text-ink transition-transform ${showDetails ? "rotate-180" : ""}`}
            aria-hidden
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        <div className={showDetails ? "border-t border-line p-5 flex flex-col gap-4" : "hidden"}>
          <div>
            <FieldLabel hint={t("fields.descriptionHint")}>
              {t("fields.description")}
            </FieldLabel>
            <textarea
              name="description"
              rows={5}
              maxLength={2000}
              defaultValue={defaults.description ?? ""}
              placeholder=""
              className={`${fieldClass} resize-y`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel>{t("fields.bodyType")}</FieldLabel>
              <select
                name="body_type"
                defaultValue={defaults.body_type ?? ""}
                className={fieldClass}
              >
                <option value="">—</option>
                {(["sedan", "suv", "wagon", "hatchback", "coupe"] as const).map((k) => (
                  <option key={k} value={k}>
                    {tDetail(`bodyType.${k}`)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel>{t("fields.driveType")}</FieldLabel>
              <select
                name="drive_type"
                defaultValue={defaults.drive_type ?? ""}
                className={fieldClass}
              >
                <option value="">—</option>
                {(["fwd", "rwd", "awd"] as const).map((k) => (
                  <option key={k} value={k}>
                    {tDetail(`driveType.${k}`)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel>{t("fields.engineVolume")}</FieldLabel>
              <input
                name="engine_volume"
                type="number"
                inputMode="decimal"
                step="0.1"
                min={0.5}
                max={8}
                defaultValue={defaults.engine_volume ?? ""}
                placeholder="3.0"
                className={fieldClass}
              />
            </div>
            <div>
              <FieldLabel>{t("fields.power")}</FieldLabel>
              <input
                name="power_hp"
                type="number"
                inputMode="numeric"
                min={1}
                defaultValue={defaults.power_hp ?? ""}
                placeholder="265"
                className={fieldClass}
              />
            </div>
            <div>
              <FieldLabel>{t("fields.color")}</FieldLabel>
              <input
                name="color"
                type="text"
                defaultValue={defaults.color ?? ""}
                placeholder=""
                className={fieldClass}
              />
            </div>
            <div>
              <FieldLabel hint={t("vinHint")}>{t("fields.vin")}</FieldLabel>
              <input
                name="vin"
                type="text"
                maxLength={17}
                defaultValue={defaults.vin ?? ""}
                placeholder="WBA53AT0X0CL12345"
                className={`${fieldClass} font-mono uppercase tracking-[0.05em]`}
              />
            </div>
          </div>

          <div>
            <FieldLabel>{t("fields.condition")}</FieldLabel>
            <div className="grid grid-cols-3 gap-2">
              {(["new", "used", "damaged"] as const).map((c) => (
                <label
                  key={c}
                  className="flex items-center gap-2 border-[1.5px] border-line-strong px-3 py-2.5 cursor-pointer text-[13px] hover:border-ink"
                >
                  <input
                    type="radio"
                    name="condition"
                    value={c}
                    defaultChecked={conditionDefault === c}
                    className="w-3.5 h-3.5 accent-[#0052ff]"
                  />
                  {t(`condition.${c}`)}
                </label>
              ))}
            </div>
          </div>

          <div>
            <FieldLabel>{t("fields.customs")}</FieldLabel>
            <div className="grid grid-cols-2 gap-2">
              {(["yes", "no"] as const).map((c) => (
                <label
                  key={c}
                  className="flex items-center gap-2 border-[1.5px] border-line-strong px-3 py-2.5 cursor-pointer text-[13px] hover:border-ink"
                >
                  <input
                    type="radio"
                    name="customs"
                    value={c}
                    defaultChecked={customsDefault === c}
                    className="w-3.5 h-3.5 accent-[#0052ff]"
                  />
                  {t(`customs.${c}`)}
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
