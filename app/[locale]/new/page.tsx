"use client";

import { useTranslations } from "next-intl";

const BRANDS = [
  "Audi", "BMW", "Citroën", "Ford", "Mercedes-Benz",
  "Opel", "Peugeot", "Renault", "Škoda", "Tesla", "Volkswagen", "Volvo",
];

const COUNTRIES = ["DE", "PL", "NL", "CZ", "BE", "FR"] as const;

const fieldClass =
  "w-full border-[1.5px] border-line-strong bg-white px-3 py-2.5 font-sans text-[14px] text-ink outline-none focus:border-ink focus:border-2 focus:px-[11px] focus:py-[9px]";

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-3">
      <label className="font-sans font-bold text-[10.5px] uppercase tracking-[0.1em] text-ink-muted">
        {children}
      </label>
      {hint && (
        <span className="font-mono text-[10px] text-ink-faded">{hint}</span>
      )}
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

function PhotosDropZone() {
  const t = useTranslations("NewListing");
  return (
    <div className="border-[2px] border-dashed border-line-strong bg-bg-subtle hover:border-accent hover:bg-accent-soft transition-colors cursor-pointer text-center px-6 py-10">
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="mx-auto mb-3 text-ink-muted"
        aria-hidden
      >
        <rect x="3" y="3" width="18" height="18" rx="0" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </svg>
      <p className="font-sans font-semibold text-[13px] text-ink mb-1">
        {t("photosDropzone")}
      </p>
      <p className="font-mono text-[11px] text-ink-faded">
        {t("photosHint")}
      </p>
    </div>
  );
}

function TierCard({
  active,
  title,
  price,
  desc,
}: {
  active?: boolean;
  title: string;
  price: string;
  desc: string;
}) {
  return (
    <label
      className={`relative flex flex-col gap-2 border-[1.5px] p-4 cursor-pointer transition-all ${
        active
          ? "border-ink shadow-[3px_3px_0_var(--accent)]"
          : "border-line-strong hover:border-ink"
      }`}
    >
      <input
        type="radio"
        name="tier"
        defaultChecked={active}
        className="absolute top-3 right-3 w-3.5 h-3.5 accent-[#0052ff]"
      />
      <div className="font-sans font-extrabold text-[13px] uppercase tracking-[0.08em] text-ink pr-7">
        {title}
      </div>
      <div className="font-mono font-bold text-[22px] text-ink tracking-[-0.02em]">
        {price}
      </div>
      <div className="font-sans text-[12px] text-ink-muted leading-relaxed">
        {desc}
      </div>
    </label>
  );
}

export default function NewListingPage() {
  const t = useTranslations("NewListing");
  const tListing = useTranslations("ListingCard");
  const tDetail = useTranslations("ListingDetail");
  const tSidebar = useTranslations("Sidebar");

  return (
    <div className="max-w-[860px] w-full mx-auto px-6 py-8">
      <header className="mb-6">
        <h1 className="font-sans font-black text-[36px] sm:text-[44px] uppercase tracking-[-0.04em] text-ink leading-none">
          {t("title")}
        </h1>
        <p className="font-sans text-[14px] text-ink-muted mt-2">
          {t("subtitle")}
        </p>
      </header>

      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex flex-col gap-4"
      >
        {/* 1. Vehicle */}
        <SectionCard index={1} title={t("sections.vehicle")}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel>{t("fields.brand")}</FieldLabel>
              <select defaultValue="" className={fieldClass} required>
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
              <select defaultValue="" className={fieldClass} disabled>
                <option value="">{tSidebar("placeholders.anyModel")}</option>
              </select>
            </div>
            <div>
              <FieldLabel>{t("fields.year")}</FieldLabel>
              <input
                type="number"
                min={1990}
                max={2026}
                placeholder="2020"
                className={fieldClass}
                required
              />
            </div>
            <div>
              <FieldLabel>{t("fields.mileage")}</FieldLabel>
              <input
                type="number"
                min={0}
                placeholder="87 000"
                className={fieldClass}
                required
              />
            </div>
          </div>
        </SectionCard>

        {/* 2. Technical */}
        <SectionCard index={2} title={t("sections.technical")}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel>{t("fields.fuel")}</FieldLabel>
              <select defaultValue="" className={fieldClass} required>
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
              <select defaultValue="" className={fieldClass} required>
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
            <div>
              <FieldLabel>{t("fields.bodyType")}</FieldLabel>
              <select defaultValue="" className={fieldClass}>
                <option value="" disabled>
                  —
                </option>
                {(["sedan", "suv", "wagon", "hatchback", "coupe"] as const).map((k) => (
                  <option key={k} value={k}>
                    {tDetail(`bodyType.${k}`)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel>{t("fields.driveType")}</FieldLabel>
              <select defaultValue="" className={fieldClass}>
                <option value="" disabled>
                  —
                </option>
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
                type="number"
                step="0.1"
                min={0.5}
                max={8}
                placeholder="3.0"
                className={fieldClass}
              />
            </div>
            <div>
              <FieldLabel>{t("fields.power")}</FieldLabel>
              <input type="number" min={1} placeholder="265" className={fieldClass} />
            </div>
            <div>
              <FieldLabel>{t("fields.color")}</FieldLabel>
              <input type="text" placeholder="" className={fieldClass} />
            </div>
            <div>
              <FieldLabel hint={t("vinHint")}>{t("fields.vin")}</FieldLabel>
              <input
                type="text"
                maxLength={17}
                placeholder="WBA53AT0X0CL12345"
                className={`${fieldClass} font-mono uppercase tracking-[0.05em]`}
              />
            </div>
          </div>
        </SectionCard>

        {/* 3. Location & Condition */}
        <SectionCard index={3} title={t("sections.location")}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel>{t("fields.country")}</FieldLabel>
              <select defaultValue="" className={fieldClass} required>
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
              <input type="text" placeholder="" className={fieldClass} required />
            </div>
          </div>

          <div>
            <FieldLabel>{t("fields.condition")}</FieldLabel>
            <div className="grid grid-cols-3 gap-2">
              {(["new", "used", "damaged"] as const).map((c, i) => (
                <label
                  key={c}
                  className="flex items-center gap-2 border-[1.5px] border-line-strong px-3 py-2.5 cursor-pointer text-[13px] hover:border-ink"
                >
                  <input
                    type="radio"
                    name="condition"
                    value={c}
                    defaultChecked={i === 1}
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
              {(["yes", "no"] as const).map((c, i) => (
                <label
                  key={c}
                  className="flex items-center gap-2 border-[1.5px] border-line-strong px-3 py-2.5 cursor-pointer text-[13px] hover:border-ink"
                >
                  <input
                    type="radio"
                    name="customs"
                    value={c}
                    defaultChecked={i === 1}
                    className="w-3.5 h-3.5 accent-[#0052ff]"
                  />
                  {t(`customs.${c}`)}
                </label>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* 4. Price & Description */}
        <SectionCard index={4} title={t("sections.price")}>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-end">
            <div>
              <FieldLabel>{t("fields.price")}</FieldLabel>
              <input
                type="number"
                min={0}
                placeholder="14 500"
                className={fieldClass}
                required
              />
            </div>
            <label className="flex items-center gap-2 text-[13px] cursor-pointer pb-3 self-end">
              <input
                type="checkbox"
                className="w-3.5 h-3.5 accent-[#0052ff]"
              />
              {t("fields.negotiable")}
            </label>
          </div>

          <div>
            <FieldLabel hint={t("fields.descriptionHint")}>
              {t("fields.description")}
            </FieldLabel>
            <textarea
              rows={6}
              maxLength={2000}
              placeholder=""
              className={`${fieldClass} resize-y`}
            />
          </div>
        </SectionCard>

        {/* 5. Photos */}
        <SectionCard index={5} title={t("sections.photos")}>
          <PhotosDropZone />
        </SectionCard>

        {/* 6. Premium */}
        <SectionCard index={6} title={t("sections.premium")}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TierCard
              active
              title={t("tiers.free.title")}
              price={t("tiers.free.price")}
              desc={t("tiers.free.desc")}
            />
            <TierCard
              title={t("tiers.bump.title")}
              price={t("tiers.bump.price")}
              desc={t("tiers.bump.desc")}
            />
            <TierCard
              title={t("tiers.premium14.title")}
              price={t("tiers.premium14.price")}
              desc={t("tiers.premium14.desc")}
            />
            <TierCard
              title={t("tiers.premium30.title")}
              price={t("tiers.premium30.price")}
              desc={t("tiers.premium30.desc")}
            />
          </div>
        </SectionCard>

        {/* Publish */}
        <div className="sticky bottom-3 z-10 mt-2">
          <button
            type="submit"
            className="w-full bg-accent hover:bg-accent-2 text-white font-sans font-extrabold text-[14px] uppercase tracking-[0.14em] py-4 transition-colors cursor-pointer border-[1.5px] border-ink shadow-[3px_3px_0_var(--ink)] hover:shadow-[6px_6px_0_var(--ink)] hover:-translate-x-[3px] hover:-translate-y-[3px] transition-all"
          >
            {t("publish")}
          </button>
        </div>
      </form>
    </div>
  );
}
