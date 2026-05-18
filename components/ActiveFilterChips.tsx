"use client";

import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import {
  buildSearchString,
  parseFilters,
  type FilterState,
} from "@/lib/filters";
import type {
  BodyTypeKey,
  FuelKey,
  TransmissionKey,
} from "@/lib/mock-listings";

type Chip = {
  /** Stable key for React. */
  key: string;
  /** Display label (already i18n'd). */
  label: string;
  /** Returns the partial FilterState to merge that clears this chip. */
  clear: (current: FilterState) => Partial<FilterState>;
};

export function ActiveFilterChips() {
  const t = useTranslations("ActiveFilters");
  const tCard = useTranslations("ListingCard");
  const tDetail = useTranslations("ListingDetail");
  const tSidebar = useTranslations("Sidebar");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const raw: Record<string, string | string[] | undefined> = {};
  searchParams.forEach((v, k) => {
    raw[k] = v;
  });
  const filters = parseFilters(raw);

  const chips: Chip[] = [];

  if (filters.q) {
    chips.push({
      key: "q",
      label: `"${filters.q}"`,
      clear: () => ({ q: undefined }),
    });
  }
  if (filters.brand) {
    chips.push({
      key: "brand",
      label: filters.brand,
      // Clearing brand also clears model (model is meaningless without brand)
      clear: () => ({ brand: undefined, model: undefined }),
    });
  }
  if (filters.model) {
    chips.push({
      key: "model",
      label: filters.model,
      clear: () => ({ model: undefined }),
    });
  }
  filters.countries?.forEach((code) => {
    chips.push({
      key: `country:${code}`,
      label: tSidebar(`countries.${code}`),
      clear: (cur) => ({
        countries: (cur.countries ?? []).filter((c) => c !== code),
      }),
    });
  });
  filters.fuels?.forEach((f) => {
    chips.push({
      key: `fuel:${f}`,
      label: tCard(`fuel.${f}`),
      clear: (cur) => ({
        fuels: (cur.fuels ?? []).filter((x) => x !== f) as FuelKey[],
      }),
    });
  });
  filters.transmissions?.forEach((tr) => {
    chips.push({
      key: `transmission:${tr}`,
      label: tCard(`transmission.${tr}`),
      clear: (cur) => ({
        transmissions: (cur.transmissions ?? []).filter(
          (x) => x !== tr
        ) as TransmissionKey[],
      }),
    });
  });
  filters.bodyTypes?.forEach((b) => {
    chips.push({
      key: `body:${b}`,
      label: tDetail(`bodyType.${b}`),
      clear: (cur) => ({
        bodyTypes: (cur.bodyTypes ?? []).filter(
          (x) => x !== b
        ) as BodyTypeKey[],
      }),
    });
  });
  if (filters.yearFrom !== undefined || filters.yearTo !== undefined) {
    chips.push({
      key: "year",
      label: `${t("year")} ${filters.yearFrom ?? "—"}…${filters.yearTo ?? "—"}`,
      clear: () => ({ yearFrom: undefined, yearTo: undefined }),
    });
  }
  if (filters.priceFrom !== undefined || filters.priceTo !== undefined) {
    const fmt = (n?: number) =>
      n !== undefined ? `€${Math.round(n / 1000)}k` : "—";
    chips.push({
      key: "price",
      label: `${t("price")} ${fmt(filters.priceFrom)}…${fmt(filters.priceTo)}`,
      clear: () => ({ priceFrom: undefined, priceTo: undefined }),
    });
  }
  if (filters.mileageFrom !== undefined || filters.mileageTo !== undefined) {
    const fmt = (n?: number) =>
      n !== undefined ? `${Math.round(n / 1000)}k` : "—";
    chips.push({
      key: "mileage",
      label: `${t("mileage")} ${fmt(filters.mileageFrom)}…${fmt(filters.mileageTo)} km`,
      clear: () => ({ mileageFrom: undefined, mileageTo: undefined }),
    });
  }

  if (chips.length === 0) return null;

  const removeChip = (chip: Chip) => {
    const patch = chip.clear(filters);
    router.push(
      `${pathname}${buildSearchString({
        ...filters,
        ...patch,
        page: 1,
      })}`
    );
  };

  const clearAll = () => {
    router.push(pathname);
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faded mr-1">
        {t("label")}
      </span>
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => removeChip(chip)}
          className="inline-flex items-center gap-1.5 bg-white border-[1.5px] border-ink hover:bg-ink hover:text-white px-2.5 py-1 font-sans font-bold text-[11px] text-ink uppercase tracking-[0.06em] cursor-pointer transition-colors"
          aria-label={`${t("removeAria")}: ${chip.label}`}
        >
          {chip.label}
          <svg
            width="10"
            height="10"
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
      ))}

      {chips.length > 1 && (
        <button
          type="button"
          onClick={clearAll}
          className="ml-1 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted hover:text-accent cursor-pointer bg-transparent border-0 underline decoration-dashed underline-offset-2"
        >
          {t("clearAll")}
        </button>
      )}
    </div>
  );
}
