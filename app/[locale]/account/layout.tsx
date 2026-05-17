import { getLocale, getTranslations } from "next-intl/server";
import { AccountNav } from "@/components/AccountNav";

const USER = {
  name: "Олександр К.",
  initials: "ОК",
  email: "olexandr@example.com",
  city: { uk: "Берлін", ru: "Берлин", en: "Berlin" } as Record<"uk" | "ru" | "en", string>,
  country: "DE",
  memberSinceYear: 2024,
};

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = (await getLocale()) as "uk" | "ru" | "en";
  const t = await getTranslations("Account");

  return (
    <div className="max-w-[1400px] w-full mx-auto px-6 py-6 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-5">
      <div className="flex flex-col gap-3">
        {/* User badge card */}
        <div className="bg-white border-[1.5px] border-ink p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-accent text-white grid place-items-center font-sans font-black text-[16px] flex-shrink-0">
              {USER.initials}
            </div>
            <div className="min-w-0">
              <div className="font-sans font-bold text-[14px] text-ink leading-tight truncate">
                {USER.name}
              </div>
              <div className="font-mono text-[11px] text-ink-muted mt-0.5 flex items-center gap-1.5 truncate">
                <span className="bg-ink text-white text-[9px] font-bold px-1 py-px tracking-[0.04em]">
                  {USER.country}
                </span>
                {USER.city[locale]}
              </div>
            </div>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faded mt-3 pt-3 border-t border-line">
            {t("nav.memberSince", { year: USER.memberSinceYear })}
          </div>
        </div>

        <AccountNav />
      </div>

      <div className="min-w-0">{children}</div>
    </div>
  );
}
