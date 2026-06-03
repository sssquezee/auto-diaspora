import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LangSwitcher } from "./LangSwitcher";

export async function TopStrip() {
  const t = await getTranslations("TopStrip");

  const linkClass = "hover:text-accent mr-[18px] no-underline transition-colors";

  return (
    <div className="bg-bg-dark text-[#b5b5b5] text-[12px] py-1.5">
      <div className="max-w-[1400px] mx-auto px-6 flex justify-between items-center">
        <nav className="flex items-center">
          <Link href="/how-it-works" className={linkClass}>
            {t("howItWorks")}
          </Link>
          <Link href="/for-dealers" className={linkClass}>
            {t("forDealers")}
          </Link>
          <Link href="/help" className="hover:text-accent no-underline transition-colors">
            {t("help")}
          </Link>
        </nav>
        <LangSwitcher />
      </div>
    </div>
  );
}
