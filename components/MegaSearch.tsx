"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { buildSearchString } from "@/lib/filters";
import { BRANDS, getModelsForBrand } from "@/lib/brands";

const COUNTRY_CODES = ["DE", "PL", "NL", "CZ", "BE", "FR"] as const;

export function MegaSearch() {
  const t = useTranslations("Header.search");
  const tSidebar = useTranslations("Sidebar");
  const router = useRouter();

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [country, setCountry] = useState("");

  const models = useMemo(() => getModelsForBrand(brand), [brand]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const qs = buildSearchString({
      brand: brand || undefined,
      model: model || undefined,
      countries: country ? [country] : undefined,
      sortBy: "premium",
      page: 1,
    });
    router.push(`/search${qs}`);
  };

  const fieldBase =
    "bg-white border-r border-line px-3.5 py-3 text-[13px] font-sans font-medium text-ink outline-none cursor-pointer hover:bg-bg-subtle appearance-none";

  return (
    <form
      role="search"
      aria-label="Auto search"
      onSubmit={handleSubmit}
      className="grid grid-cols-[1.5fr_1fr_1fr_auto] border-2 border-ink w-full max-w-[720px] overflow-hidden"
    >
      <select
        value={brand}
        onChange={(e) => {
          setBrand(e.target.value);
          setModel("");
        }}
        className={fieldBase}
        aria-label={t("anyBrand")}
      >
        <option value="">{t("anyBrand")}</option>
        {BRANDS.map((b) => (
          <option key={b} value={b}>
            {b}
          </option>
        ))}
      </select>

      <select
        value={model}
        onChange={(e) => setModel(e.target.value)}
        className={`${fieldBase} disabled:cursor-not-allowed disabled:text-ink-faded`}
        aria-label={t("anyModel")}
        disabled={!brand}
        title={!brand ? t("anyBrand") : undefined}
      >
        <option value="">{t("anyModel")}</option>
        {models.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>

      <select
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        className={fieldBase}
        aria-label={t("anyCountry")}
      >
        <option value="">{t("anyCountry")}</option>
        {COUNTRY_CODES.map((c) => (
          <option key={c} value={c}>
            {tSidebar(`countries.${c}`)}
          </option>
        ))}
      </select>

      <button
        type="submit"
        className="bg-accent hover:bg-accent-2 text-white font-sans font-extrabold text-[13px] tracking-[1px] uppercase px-[22px] transition-colors cursor-pointer border-0"
      >
        {t("submit")}
      </button>
    </form>
  );
}
