"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import {
  buildSearchString,
  countActiveFilters,
  parseFilters,
  type FilterState,
} from "@/lib/filters";
import type { BodyTypeKey, FuelKey, TransmissionKey } from "@/lib/mock-listings";
import { BRANDS, getModelsForBrand } from "@/lib/brands";

// Sorted alphabetically by ISO code so the dropdown is predictable
// across all three locales (we'd need per-locale sort to honour the
// native alphabet, which is overkill for a 27-item list).
const COUNTRIES: string[] = [
  "AT", "BE", "BG", "CH", "CZ", "DE", "DK", "EE", "ES", "FI",
  "FR", "GR", "HR", "HU", "IE", "IT", "LT", "LU", "LV", "NL",
  "NO", "PL", "PT", "RO", "SE", "SI", "SK",
];

const FUELS: FuelKey[] = ["diesel", "petrol", "hybrid", "electric"];

const TRANSMISSIONS: TransmissionKey[] = ["auto", "manual"];

const BODIES: BodyTypeKey[] = ["sedan", "suv", "wagon", "hatchback", "coupe"];

function FilterLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block font-sans font-bold text-[10.5px] uppercase tracking-[0.1em] text-ink-muted mb-1.5">
      {children}
    </label>
  );
}

const fieldClass =
  "w-full border border-line-strong bg-white px-2.5 py-2 font-sans text-[13px] text-ink outline-none focus:border-ink focus:border-2 focus:px-[9px] focus:py-[7px]";

type DraftState = {
  brand: string;
  model: string;
  countries: Set<string>;
  fuels: Set<FuelKey>;
  transmissions: Set<TransmissionKey>;
  bodyTypes: Set<BodyTypeKey>;
  yearFrom: string;
  yearTo: string;
  priceFrom: string;
  priceTo: string;
  mileageFrom: string;
  mileageTo: string;
};

function emptyDraft(): DraftState {
  return {
    brand: "",
    model: "",
    countries: new Set(),
    fuels: new Set(),
    transmissions: new Set(),
    bodyTypes: new Set(),
    yearFrom: "",
    yearTo: "",
    priceFrom: "",
    priceTo: "",
    mileageFrom: "",
    mileageTo: "",
  };
}

function filtersToDraft(f: FilterState): DraftState {
  return {
    brand: f.brand ?? "",
    model: f.model ?? "",
    countries: new Set(f.countries ?? []),
    fuels: new Set(f.fuels ?? []),
    transmissions: new Set(f.transmissions ?? []),
    bodyTypes: new Set(f.bodyTypes ?? []),
    yearFrom: f.yearFrom !== undefined ? String(f.yearFrom) : "",
    yearTo: f.yearTo !== undefined ? String(f.yearTo) : "",
    priceFrom: f.priceFrom !== undefined ? String(f.priceFrom) : "",
    priceTo: f.priceTo !== undefined ? String(f.priceTo) : "",
    mileageFrom: f.mileageFrom !== undefined ? String(f.mileageFrom) : "",
    mileageTo: f.mileageTo !== undefined ? String(f.mileageTo) : "",
  };
}

function draftToPartial(d: DraftState): Partial<FilterState> {
  const num = (s: string) => {
    const n = Number(s);
    return s !== "" && Number.isFinite(n) ? n : undefined;
  };
  return {
    brand: d.brand || undefined,
    model: d.model || undefined,
    countries: d.countries.size > 0 ? Array.from(d.countries) : undefined,
    fuels: d.fuels.size > 0 ? Array.from(d.fuels) : undefined,
    transmissions: d.transmissions.size > 0 ? Array.from(d.transmissions) : undefined,
    bodyTypes: d.bodyTypes.size > 0 ? Array.from(d.bodyTypes) : undefined,
    yearFrom: num(d.yearFrom),
    yearTo: num(d.yearTo),
    priceFrom: num(d.priceFrom),
    priceTo: num(d.priceTo),
    mileageFrom: num(d.mileageFrom),
    mileageTo: num(d.mileageTo),
  };
}

export function Sidebar() {
  const t = useTranslations("Sidebar");
  const fuelT = useTranslations("ListingCard.fuel");
  const bodyT = useTranslations("ListingDetail.bodyType");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse current URL into FilterState
  const currentFilters = useMemo(() => {
    const raw: Record<string, string | string[] | undefined> = {};
    searchParams.forEach((value, key) => {
      raw[key] = value;
    });
    return parseFilters(raw);
  }, [searchParams]);

  const activeCount = countActiveFilters(currentFilters);

  // Draft state (form values being edited, not yet applied)
  const [draft, setDraft] = useState<DraftState>(() => filtersToDraft(currentFilters));

  // Re-sync draft when URL changes (e.g. back/forward, link from chip)
  useEffect(() => {
    setDraft(filtersToDraft(currentFilters));
  }, [currentFilters]);

  const [mobileOpen, setMobileOpen] = useState(false);

  // Close on Esc + lock background scroll while drawer is open
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileOpen]);

  const apply = () => {
    const next: Partial<FilterState> = {
      ...draftToPartial(draft),
      sortBy: currentFilters.sortBy,
      page: 1, // reset to page 1 on new filter apply
    };
    router.push(`${pathname}${buildSearchString(next)}`);
    setMobileOpen(false);
  };

  const reset = () => {
    setDraft(emptyDraft());
    router.push(pathname);
    setMobileOpen(false);
  };

  const toggleCountry = (code: string) => {
    setDraft((d) => {
      const next = new Set(d.countries);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return { ...d, countries: next };
    });
  };
  const toggleFuel = (key: FuelKey) => {
    setDraft((d) => {
      const next = new Set(d.fuels);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return { ...d, fuels: next };
    });
  };
  const toggleTransmission = (key: TransmissionKey) => {
    setDraft((d) => {
      const next = new Set(d.transmissions);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return { ...d, transmissions: next };
    });
  };
  const toggleBody = (key: BodyTypeKey) => {
    setDraft((d) => {
      const next = new Set(d.bodyTypes);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return { ...d, bodyTypes: next };
    });
  };

  const panelHeader = (
    <div className="bg-ink text-white px-4 py-3 flex justify-between items-center font-sans font-extrabold text-[12px] tracking-[0.16em] uppercase">
      <span>{t("title")}</span>
      <div className="flex items-center gap-2">
        {activeCount > 0 && (
          <span className="bg-accent text-white font-mono font-bold text-[10px] px-[7px] py-[2px]">
            {activeCount}
          </span>
        )}
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          aria-label={t("closeAria")}
          className="md:hidden -my-1 -mr-1 w-7 h-7 grid place-items-center text-white hover:text-accent bg-transparent border-0 cursor-pointer"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );

  const panelForm = (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          apply();
        }}
        className="p-4 flex flex-col gap-4"
      >
        {/* Brand + Model */}
        <div>
          <FilterLabel>{t("labels.brand")}</FilterLabel>
          <select
            className={fieldClass}
            value={draft.brand}
            onChange={(e) =>
              setDraft((d) => ({ ...d, brand: e.target.value, model: "" }))
            }
            aria-label={t("labels.brand")}
          >
            <option value="">{t("placeholders.anyBrand")}</option>
            {BRANDS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div>
          <FilterLabel>{t("labels.model")}</FilterLabel>
          <select
            className={`${fieldClass} disabled:cursor-not-allowed disabled:text-ink-faded`}
            value={draft.model}
            onChange={(e) => setDraft((d) => ({ ...d, model: e.target.value }))}
            disabled={!draft.brand}
            aria-label={t("labels.model")}
          >
            <option value="">{t("placeholders.anyModel")}</option>
            {getModelsForBrand(draft.brand).map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Year range */}
        <div>
          <FilterLabel>{t("labels.year")}</FilterLabel>
          <div className="grid grid-cols-2 gap-1.5">
            <input
              type="number"
              placeholder={t("placeholders.yearFrom")}
              className={fieldClass}
              value={draft.yearFrom}
              onChange={(e) => setDraft((d) => ({ ...d, yearFrom: e.target.value }))}
              aria-label="Year from"
            />
            <input
              type="number"
              placeholder={t("placeholders.yearTo")}
              className={fieldClass}
              value={draft.yearTo}
              onChange={(e) => setDraft((d) => ({ ...d, yearTo: e.target.value }))}
              aria-label="Year to"
            />
          </div>
        </div>

        {/* Price range */}
        <div>
          <FilterLabel>{t("labels.price")}</FilterLabel>
          <div className="grid grid-cols-2 gap-1.5">
            <input
              type="number"
              placeholder={t("placeholders.priceFrom")}
              className={fieldClass}
              value={draft.priceFrom}
              onChange={(e) => setDraft((d) => ({ ...d, priceFrom: e.target.value }))}
              aria-label="Price from"
            />
            <input
              type="number"
              placeholder={t("placeholders.priceTo")}
              className={fieldClass}
              value={draft.priceTo}
              onChange={(e) => setDraft((d) => ({ ...d, priceTo: e.target.value }))}
              aria-label="Price to"
            />
          </div>
        </div>

        {/* Mileage range */}
        <div>
          <FilterLabel>{t("labels.mileage")}</FilterLabel>
          <div className="grid grid-cols-2 gap-1.5">
            <input
              type="number"
              placeholder={t("placeholders.mileageFrom")}
              className={fieldClass}
              value={draft.mileageFrom}
              onChange={(e) => setDraft((d) => ({ ...d, mileageFrom: e.target.value }))}
              aria-label="Mileage from"
            />
            <input
              type="number"
              placeholder={t("placeholders.mileageTo")}
              className={fieldClass}
              value={draft.mileageTo}
              onChange={(e) => setDraft((d) => ({ ...d, mileageTo: e.target.value }))}
              aria-label="Mileage to"
            />
          </div>
        </div>

        {/* Country */}
        <div>
          <FilterLabel>{t("labels.country")}</FilterLabel>
          <div className="flex flex-col gap-1">
            {COUNTRIES.map((c) => (
              <label
                key={c}
                className="flex items-center gap-2 text-[13px] text-ink-muted hover:text-ink py-[3px] cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={draft.countries.has(c)}
                  onChange={() => toggleCountry(c)}
                  className="w-3.5 h-3.5 accent-[#0052ff]"
                />
                {t(`countries.${c}`)}
              </label>
            ))}
          </div>
        </div>

        {/* Fuel */}
        <div>
          <FilterLabel>{t("labels.fuel")}</FilterLabel>
          <div className="flex flex-col gap-1">
            {FUELS.map((f) => (
              <label
                key={f}
                className="flex items-center gap-2 text-[13px] text-ink-muted hover:text-ink py-[3px] cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={draft.fuels.has(f)}
                  onChange={() => toggleFuel(f)}
                  className="w-3.5 h-3.5 accent-[#0052ff]"
                />
                {fuelT(f)}
              </label>
            ))}
          </div>
        </div>

        {/* Transmission */}
        <div>
          <FilterLabel>{t("labels.transmission")}</FilterLabel>
          <div className="flex flex-col gap-1">
            {TRANSMISSIONS.map((tr) => (
              <label
                key={tr}
                className="flex items-center gap-2 text-[13px] text-ink-muted hover:text-ink py-[3px] cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={draft.transmissions.has(tr)}
                  onChange={() => toggleTransmission(tr)}
                  className="w-3.5 h-3.5 accent-[#0052ff]"
                />
                {t(`transmission.${tr}`)}
              </label>
            ))}
          </div>
        </div>

        {/* Body type */}
        <div>
          <FilterLabel>{t("labels.bodyType")}</FilterLabel>
          <div className="flex flex-col gap-1">
            {BODIES.map((b) => (
              <label
                key={b}
                className="flex items-center gap-2 text-[13px] text-ink-muted hover:text-ink py-[3px] cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={draft.bodyTypes.has(b)}
                  onChange={() => toggleBody(b)}
                  className="w-3.5 h-3.5 accent-[#0052ff]"
                />
                {bodyT(b)}
              </label>
            ))}
          </div>
        </div>

        {/* Apply CTA */}
        <button
          type="submit"
          className="w-full bg-accent hover:bg-accent-2 text-white font-sans font-extrabold text-[12px] uppercase tracking-[0.13em] py-3 transition-colors cursor-pointer border-0 mt-1"
        >
          {t("apply")}
        </button>

        {/* Reset (only when there are active filters) */}
        {activeCount > 0 && (
          <button
            type="button"
            onClick={reset}
            className="text-center font-sans font-bold text-[12px] text-ink cursor-pointer bg-transparent border-0 underline decoration-line decoration-1 underline-offset-[3px] hover:text-accent hover:decoration-accent hover:decoration-2"
          >
            {t("reset")}
          </button>
        )}

      </form>
  );

  return (
    <>
      {/* Mobile trigger — floating bottom-right */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed bottom-4 right-4 z-30 bg-accent hover:bg-accent-2 text-white border-[1.5px] border-ink shadow-[3px_3px_0_var(--ink)] hover:shadow-[6px_6px_0_var(--ink)] hover:-translate-x-[3px] hover:-translate-y-[3px] transition-all px-4 py-3 cursor-pointer flex items-center gap-2 font-sans font-extrabold text-[12px] uppercase tracking-[0.13em]"
        aria-label={t("title")}
        aria-expanded={mobileOpen}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="7" y1="12" x2="17" y2="12" />
          <line x1="10" y1="18" x2="14" y2="18" />
        </svg>
        {t("title")}
        {activeCount > 0 && (
          <span className="bg-white text-accent font-mono font-bold text-[10px] px-[6px] py-px">
            {activeCount}
          </span>
        )}
      </button>

      {/* Desktop aside */}
      <aside
        aria-label="Filters"
        className="hidden md:block bg-white border-[1.5px] border-ink h-fit sticky top-3.5"
      >
        {panelHeader}
        {panelForm}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setMobileOpen(false)}
          role="presentation"
        >
          <aside
            aria-label="Filters"
            className="fixed inset-y-0 left-0 w-[min(320px,86vw)] bg-white border-r-[1.5px] border-ink overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {panelHeader}
            {panelForm}
          </aside>
        </div>
      )}
    </>
  );
}
