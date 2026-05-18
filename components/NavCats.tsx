"use client";

import { useTranslations } from "next-intl";
import { usePathname, useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import type { BodyTypeKey, FuelKey } from "@/lib/mock-listings";

type CategoryDef = {
  key: string;
  /** URL query (everything after "?") this category applies. Empty string = no filters. */
  query: string;
  /** Filter signature used to detect active state. Empty = "all". */
  signature: {
    bodyTypes?: BodyTypeKey[];
    fuels?: FuelKey[];
  };
  disabled?: boolean;
};

const CATEGORIES: CategoryDef[] = [
  { key: "all", query: "", signature: {} },
  {
    key: "cars",
    query: "body=sedan,wagon,hatchback,coupe",
    signature: { bodyTypes: ["sedan", "wagon", "hatchback", "coupe"] },
  },
  {
    key: "suv",
    query: "body=suv",
    signature: { bodyTypes: ["suv"] },
  },
  {
    key: "electric",
    query: "fuel=electric",
    signature: { fuels: ["electric"] },
  },
  {
    key: "hybrid",
    query: "fuel=hybrid",
    signature: { fuels: ["hybrid"] },
  },
  { key: "moto", query: "", signature: {}, disabled: true },
  { key: "commercial", query: "", signature: {}, disabled: true },
  { key: "trailers", query: "", signature: {}, disabled: true },
  { key: "parts", query: "", signature: {}, disabled: true },
];

function sameSet<T extends string>(a: T[] | undefined, b: T[]): boolean {
  const aa = a ?? [];
  if (aa.length !== b.length) return false;
  const sortedA = [...aa].sort();
  const sortedB = [...b].sort();
  return sortedA.every((v, i) => v === sortedB[i]);
}

export function NavCats() {
  const t = useTranslations("NavCats");
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlBody = searchParams.get("body")?.split(",").filter(Boolean) as
    | BodyTypeKey[]
    | undefined;
  const urlFuel = searchParams.get("fuel")?.split(",").filter(Boolean) as
    | FuelKey[]
    | undefined;
  const hasOtherFilters = Array.from(searchParams.keys()).some(
    (k) => k !== "body" && k !== "fuel" && k !== "page"
  );

  // On the catalog route, derive active. On other routes nothing is active.
  const isCatalog = pathname === "/" || /^\/[a-z]{2}$/.test(pathname);

  const activeKey = (() => {
    if (!isCatalog) return null;
    for (const cat of CATEGORIES) {
      if (cat.disabled) continue;
      const sigBody = cat.signature.bodyTypes;
      const sigFuel = cat.signature.fuels;
      const bodyMatch = sigBody
        ? sameSet(urlBody, sigBody)
        : (urlBody?.length ?? 0) === 0;
      const fuelMatch = sigFuel
        ? sameSet(urlFuel, sigFuel)
        : (urlFuel?.length ?? 0) === 0;
      if (bodyMatch && fuelMatch) {
        // "all" only wins when there are also no other filter params
        if (cat.key === "all" && hasOtherFilters) continue;
        return cat.key;
      }
    }
    return null;
  })();

  return (
    <nav aria-label="Categories" className="bg-white border-b border-line">
      <div className="max-w-[1400px] mx-auto px-6 flex overflow-x-auto">
        {CATEGORIES.map((cat) => {
          const active = activeKey === cat.key;
          const href = cat.query ? `/?${cat.query}` : "/";
          const base =
            "px-[18px] py-[13px] text-[13px] uppercase tracking-[0.04em] whitespace-nowrap no-underline transition-colors border-b-[3px]";

          if (cat.disabled) {
            return (
              <span
                key={cat.key}
                title={t("disabledHint")}
                className={`${base} text-ink-faded border-transparent cursor-not-allowed`}
                aria-disabled="true"
              >
                {t(cat.key)}
              </span>
            );
          }
          return (
            <Link
              key={cat.key}
              href={href}
              className={`${base} ${
                active
                  ? "text-ink font-extrabold border-accent"
                  : "text-ink-muted font-semibold border-transparent hover:text-ink"
              }`}
              aria-current={active ? "page" : undefined}
            >
              {t(cat.key)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
