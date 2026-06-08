"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { useTransition } from "react";

// Display label per locale. Ukrainian shows as "UA" because that's the
// country code most users recognise — the i18n route prefix is still
// "uk" (ISO 639-1 for Ukrainian language).
const LOCALE_LABEL: Record<string, string> = {
  uk: "UA",
  ru: "RU",
};

export function LangSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const switchTo = (next: string) => {
    if (next === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  };

  return (
    <div className="flex" aria-label="Language switcher">
      {routing.locales.map((lng, i) => (
        <button
          key={lng}
          type="button"
          onClick={() => switchTo(lng)}
          disabled={isPending}
          className={`font-mono text-[11px] font-bold tracking-[0.05em] uppercase px-1.5 bg-transparent cursor-pointer transition-colors ${
            lng === locale
              ? "text-white"
              : "text-ink-faded hover:text-white"
          } ${i > 0 ? "border-l border-[#333]" : ""} ${
            isPending ? "opacity-60 cursor-wait" : ""
          }`}
        >
          {LOCALE_LABEL[lng] ?? lng.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
