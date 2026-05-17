import { getTranslations } from "next-intl/server";
import { LangSwitcher } from "./LangSwitcher";

export async function TopStrip() {
  const t = await getTranslations("TopStrip");

  return (
    <div className="bg-bg-dark text-[#b5b5b5] text-[12px] py-1.5">
      <div className="max-w-[1400px] mx-auto px-6 flex justify-between items-center">
        <nav className="flex items-center">
          <a href="#" className="hover:text-accent mr-[18px] no-underline">
            {t("howItWorks")}
          </a>
          <a href="#" className="hover:text-accent mr-[18px] no-underline">
            {t("telegramBot")}
          </a>
          <a href="#" className="hover:text-accent mr-[18px] no-underline">
            {t("forDealers")}
          </a>
          <a href="#" className="hover:text-accent no-underline">
            {t("help")}
          </a>
        </nav>
        <LangSwitcher />
      </div>
    </div>
  );
}
