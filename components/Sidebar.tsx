import { getTranslations } from "next-intl/server";

const BRANDS = [
  "Audi",
  "BMW",
  "Mercedes-Benz",
  "Škoda",
  "Volkswagen",
  "Renault",
  "Peugeot",
  "Citroën",
  "Opel",
  "Ford",
];

const COUNTRIES = [
  { code: "DE", count: "3,847", defaultChecked: true },
  { code: "PL", count: "1,294", defaultChecked: true },
  { code: "NL", count: "621", defaultChecked: false },
  { code: "CZ", count: "438", defaultChecked: false },
  { code: "BE", count: "312", defaultChecked: false },
] as const;

const FUELS = [
  { key: "diesel", count: "2,841" },
  { key: "petrol", count: "2,103" },
  { key: "hybrid", count: "487" },
  { key: "electric", count: "312" },
] as const;

const TRANSMISSIONS = [
  { key: "auto", count: "3,124" },
  { key: "manual", count: "2,398" },
] as const;

const ACTIVE_FILTER_COUNT = 3;

function FilterLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block font-sans font-bold text-[10.5px] uppercase tracking-[0.1em] text-ink-muted mb-1.5">
      {children}
    </label>
  );
}

const fieldClass =
  "w-full border border-line-strong bg-white px-2.5 py-2 font-sans text-[13px] text-ink outline-none focus:border-ink focus:border-2 focus:px-[9px] focus:py-[7px]";

export async function Sidebar() {
  const t = await getTranslations("Sidebar");
  const fuelT = await getTranslations("ListingCard.fuel");

  return (
    <aside
      aria-label="Filters"
      className="hidden md:block bg-white border-[1.5px] border-ink h-fit sticky top-3.5"
    >
      {/* Header */}
      <div className="bg-ink text-white px-4 py-3 flex justify-between items-center font-sans font-extrabold text-[12px] tracking-[0.16em] uppercase">
        <span>{t("title")}</span>
        {ACTIVE_FILTER_COUNT > 0 && (
          <span className="bg-accent text-white font-mono font-bold text-[10px] px-[7px] py-[2px]">
            {ACTIVE_FILTER_COUNT}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-4">
        {/* Brand */}
        <div>
          <FilterLabel>{t("labels.brand")}</FilterLabel>
          <select defaultValue="" className={fieldClass} aria-label={t("labels.brand")}>
            <option value="">{t("placeholders.anyBrand")}</option>
            {BRANDS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* Model */}
        <div>
          <FilterLabel>{t("labels.model")}</FilterLabel>
          <select defaultValue="" className={fieldClass} disabled aria-label={t("labels.model")}>
            <option value="">{t("placeholders.anyModel")}</option>
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
              aria-label="Year from"
            />
            <input
              type="number"
              placeholder={t("placeholders.yearTo")}
              className={fieldClass}
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
              aria-label="Price from"
            />
            <input
              type="number"
              placeholder={t("placeholders.priceTo")}
              className={fieldClass}
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
              aria-label="Mileage from"
            />
            <input
              type="number"
              placeholder={t("placeholders.mileageTo")}
              className={fieldClass}
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
                key={c.code}
                className="flex items-center gap-2 text-[13px] text-ink-muted hover:text-ink py-[3px] cursor-pointer"
              >
                <input
                  type="checkbox"
                  defaultChecked={c.defaultChecked}
                  className="w-3.5 h-3.5 accent-[#0052ff]"
                />
                {t(`countries.${c.code}`)}
                <span className="ml-auto font-mono text-[11px] text-ink-faded">
                  {c.count}
                </span>
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
                key={f.key}
                className="flex items-center gap-2 text-[13px] text-ink-muted hover:text-ink py-[3px] cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="w-3.5 h-3.5 accent-[#0052ff]"
                />
                {fuelT(f.key)}
                <span className="ml-auto font-mono text-[11px] text-ink-faded">
                  {f.count}
                </span>
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
                key={tr.key}
                className="flex items-center gap-2 text-[13px] text-ink-muted hover:text-ink py-[3px] cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="w-3.5 h-3.5 accent-[#0052ff]"
                />
                {t(`transmission.${tr.key}`)}
                <span className="ml-auto font-mono text-[11px] text-ink-faded">
                  {tr.count}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Apply CTA */}
        <button
          type="button"
          className="w-full bg-accent hover:bg-accent-2 text-white font-sans font-extrabold text-[12px] uppercase tracking-[0.13em] py-3 transition-colors cursor-pointer border-0 mt-1"
        >
          {t("apply")}
        </button>

        {/* Save search link */}
        <button
          type="button"
          className="text-center font-sans font-bold text-[12px] text-ink cursor-pointer bg-transparent border-0 underline decoration-accent decoration-2 underline-offset-[3px] hover:text-accent transition-colors"
        >
          {t("saveToTelegram")}
        </button>
      </div>
    </aside>
  );
}
