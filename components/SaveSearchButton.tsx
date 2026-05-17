"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import {
  buildSearchString,
  countActiveFilters,
  parseFilters,
} from "@/lib/filters";
import { hasSavedSearchWithQuery } from "@/lib/saved-searches";
import { useSavedSearches } from "@/hooks/useSavedSearches";

function summarize(
  filters: ReturnType<typeof parseFilters>,
  allLabel: string
): string {
  const parts: string[] = [];
  if (filters.q) parts.push(`"${filters.q}"`);
  if (filters.brand) parts.push(filters.brand);
  if (filters.model) parts.push(filters.model);
  if (filters.countries?.length) parts.push(filters.countries.join(" · "));
  if (filters.fuels?.length) parts.push(filters.fuels.join(" · "));
  if (filters.transmissions?.length) parts.push(filters.transmissions.join(" · "));
  if (filters.yearFrom || filters.yearTo) {
    parts.push(`${filters.yearFrom ?? "—"}–${filters.yearTo ?? "—"}`);
  }
  if (filters.priceFrom || filters.priceTo) {
    const fmt = (n?: number) =>
      n !== undefined ? `€${Math.round(n / 1000)}k` : "—";
    parts.push(`${fmt(filters.priceFrom)}–${fmt(filters.priceTo)}`);
  }
  if (filters.mileageFrom || filters.mileageTo) {
    const fmt = (n?: number) =>
      n !== undefined ? `${Math.round(n / 1000)}k km` : "—";
    parts.push(`${fmt(filters.mileageFrom)}–${fmt(filters.mileageTo)}`);
  }
  return parts.length > 0 ? parts.join(" · ") : allLabel;
}

function defaultName(filters: ReturnType<typeof parseFilters>): string {
  if (filters.brand) {
    return filters.model ? `${filters.brand} ${filters.model}` : filters.brand;
  }
  if (filters.q) return filters.q;
  if (filters.countries?.length) return filters.countries.join(", ");
  return "";
}

export function SaveSearchButton() {
  const t = useTranslations("SavedSearches");
  const searchParams = useSearchParams();
  const { hydrated, addItem } = useSavedSearches();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [savedHere, setSavedHere] = useState(false);

  const { query, summary, activeCount, isNoOp } = useMemo(() => {
    const raw: Record<string, string | string[] | undefined> = {};
    searchParams.forEach((v, k) => {
      raw[k] = v;
    });
    const filters = parseFilters(raw);
    const queryStr = buildSearchString({ ...filters, page: 1 });
    const summaryStr = summarize(filters, t("allListings"));
    return {
      query: queryStr,
      summary: summaryStr,
      activeCount: countActiveFilters(filters),
      isNoOp: !filters.q && countActiveFilters(filters) === 0,
      filters,
    };
  }, [searchParams, t]);

  useEffect(() => {
    if (!hydrated) return;
    setSavedHere(hasSavedSearchWithQuery(query));
  }, [hydrated, query]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!hydrated || isNoOp) return null;

  if (savedHere) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-2 bg-bg-subtle border-[1.5px] border-line-strong text-ink-muted font-sans font-bold text-[11px] uppercase tracking-[0.12em]">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <polyline points="20 6 9 17 4 12" />
        </svg>
        {t("saved")}
      </span>
    );
  }

  const openModal = () => {
    const raw: Record<string, string | string[] | undefined> = {};
    searchParams.forEach((v, k) => {
      raw[k] = v;
    });
    setName(defaultName(parseFilters(raw)));
    setOpen(true);
  };

  const handleSave = () => {
    addItem({ name, query, summary });
    setOpen(false);
    setSavedHere(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border-[1.5px] border-ink hover:bg-ink hover:text-white text-ink font-sans font-bold text-[11px] uppercase tracking-[0.12em] cursor-pointer transition-colors"
        title={t("saveHint", { count: activeCount })}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
        {t("save")}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white border-[1.5px] border-ink max-w-[440px] w-full p-5"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-accent mb-1.5">
              {t("modal.kicker")}
            </p>
            <h2 className="font-sans font-black text-[22px] uppercase tracking-[-0.03em] text-ink leading-none mb-3">
              {t("modal.title")}
            </h2>
            <p className="font-mono text-[11.5px] text-ink-muted mb-4 leading-relaxed break-words">
              {summary}
            </p>

            <label className="block font-sans font-bold text-[10.5px] uppercase tracking-[0.1em] text-ink-muted mb-1.5">
              {t("modal.nameLabel")}
            </label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("modal.namePlaceholder")}
              className="w-full border-[1.5px] border-line-strong focus:border-ink focus:border-2 bg-white px-3 py-2.5 font-sans text-[14px] text-ink outline-none mb-4"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
              }}
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2.5 bg-white border-[1.5px] border-ink hover:bg-ink hover:text-white text-ink font-sans font-extrabold text-[12px] uppercase tracking-[0.12em] cursor-pointer transition-colors"
              >
                {t("modal.cancel")}
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2.5 bg-accent hover:bg-accent-2 text-white font-sans font-extrabold text-[12px] uppercase tracking-[0.12em] cursor-pointer border-0 transition-colors"
              >
                {t("modal.save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
