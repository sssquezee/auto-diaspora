import { getTranslations } from "next-intl/server";

const BRANDS_STUB = ["Audi", "BMW", "Mercedes-Benz", "Skoda", "Volkswagen"];
const COUNTRIES_STUB = [
  { code: "DE", uk: "Німеччина", ru: "Германия", en: "Germany" },
  { code: "PL", uk: "Польща", ru: "Польша", en: "Poland" },
  { code: "NL", uk: "Нідерланди", ru: "Нидерланды", en: "Netherlands" },
  { code: "CZ", uk: "Чехія", ru: "Чехия", en: "Czechia" },
  { code: "BE", uk: "Бельгія", ru: "Бельгия", en: "Belgium" },
];

export async function MegaSearch() {
  const t = await getTranslations("Header.search");

  const fieldBase =
    "bg-white border-r border-line px-3.5 py-3 text-[13px] font-sans font-medium text-ink outline-none cursor-pointer hover:bg-bg-subtle appearance-none";

  return (
    <div
      role="search"
      aria-label="Auto search"
      className="grid grid-cols-[1.5fr_1fr_1fr_auto] border-2 border-ink w-full max-w-[720px] overflow-hidden"
    >
      <select defaultValue="" className={fieldBase} aria-label="Brand">
        <option value="">{t("anyBrand")}</option>
        {BRANDS_STUB.map((b) => (
          <option key={b} value={b}>
            {b}
          </option>
        ))}
      </select>

      <select defaultValue="" className={fieldBase} aria-label="Model">
        <option value="">{t("anyModel")}</option>
      </select>

      <select defaultValue="" className={fieldBase} aria-label="Country">
        <option value="">{t("anyCountry")}</option>
        {COUNTRIES_STUB.map((c) => (
          <option key={c.code} value={c.code}>
            {c.uk}
          </option>
        ))}
      </select>

      <button
        type="button"
        className="bg-accent hover:bg-accent-2 text-white font-sans font-extrabold text-[13px] tracking-[1px] uppercase px-[22px] transition-colors cursor-pointer border-0"
      >
        {t("submit")}
      </button>
    </div>
  );
}
