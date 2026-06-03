import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Logo } from "./Logo";

type LinkItem = { label: string; href: string };

export async function Footer() {
  const t = await getTranslations("Footer");

  const sections: Array<{ title: string; links: LinkItem[] }> = [
    {
      title: t("buyers.title"),
      links: [
        { label: t("buyers.allCars"), href: "/" },
        { label: t("buyers.howToBuy"), href: "/how-it-works" },
      ],
    },
    {
      title: t("sellers.title"),
      links: [
        { label: t("sellers.publish"), href: "/new" },
        { label: t("sellers.premium"), href: "/pricing" },
        { label: t("sellers.forDealers"), href: "/for-dealers" },
      ],
    },
    {
      title: t("company.title"),
      links: [
        { label: t("company.about"), href: "/about" },
        { label: t("company.contacts"), href: "/help" },
        { label: t("company.terms"), href: "/terms" },
        { label: t("company.privacy"), href: "/privacy" },
        { label: t("company.impressum"), href: "/impressum" },
      ],
    },
  ];

  const renderLink = (item: LinkItem) => {
    const className =
      "text-[13px] text-[#888] hover:text-accent no-underline transition-colors";
    if (item.href === "#") {
      return (
        <a key={item.label} href="#" className={className}>
          {item.label}
        </a>
      );
    }
    return (
      <Link key={item.label} href={item.href} className={className}>
        {item.label}
      </Link>
    );
  };

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
            {section.links.map(renderLink)}
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
