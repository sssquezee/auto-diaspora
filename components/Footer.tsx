import { getTranslations } from "next-intl/server";
import { Logo } from "./Logo";

export async function Footer() {
  const t = await getTranslations("Footer");

  const sections = [
    {
      title: t("buyers.title"),
      links: [
        t("buyers.allCars"),
        t("buyers.howToBuy"),
        t("buyers.vinCheck"),
        t("buyers.deliveryToUkraine"),
      ],
    },
    {
      title: t("sellers.title"),
      links: [
        t("sellers.publish"),
        t("sellers.premium"),
        t("sellers.forDealers"),
      ],
    },
    {
      title: t("company.title"),
      links: [
        t("company.about"),
        t("company.contacts"),
        t("company.terms"),
        t("company.privacy"),
      ],
    },
  ];

  return (
    <footer className="bg-bg-dark text-[#888]">
      <div className="max-w-[1400px] mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <Logo className="text-[26px]" invert />
          <p className="text-[13px] max-w-[320px] mt-4 leading-relaxed">
            {t("tagline")}
          </p>
        </div>

        {sections.map((section) => (
          <div key={section.title} className="flex flex-col gap-3">
            <h4 className="text-white text-[12px] font-sans font-extrabold uppercase tracking-[0.12em] mb-1">
              {section.title}
            </h4>
            {section.links.map((label) => (
              <a
                key={label}
                href="#"
                className="text-[13px] text-[#888] hover:text-accent no-underline transition-colors"
              >
                {label}
              </a>
            ))}
          </div>
        ))}
      </div>

      <div className="border-t border-[#222]">
        <div className="max-w-[1400px] mx-auto px-6 py-4 font-mono text-[11px] uppercase tracking-[0.15em] text-[#666] flex justify-between">
          <span>{t("copyright")}</span>
          <span>{t("legal")}</span>
        </div>
      </div>
    </footer>
  );
}
