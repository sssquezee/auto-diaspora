"use client";

import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";

export function NoResults() {
  const t = useTranslations("NoResults");
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="bg-white border-[1.5px] border-ink px-6 py-16 text-center">
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mx-auto mb-4 text-ink-faded"
        aria-hidden
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
        <line x1="8" y1="11" x2="14" y2="11" />
      </svg>
      <h2 className="font-sans font-black text-[22px] sm:text-[26px] uppercase tracking-[-0.03em] text-ink mb-2">
        {t("title")}
      </h2>
      <p className="font-sans text-[13px] text-ink-muted max-w-md mx-auto mb-5 leading-relaxed">
        {t("body")}
      </p>
      <button
        type="button"
        onClick={() => router.push(pathname)}
        className="inline-block bg-accent hover:bg-accent-2 text-white font-sans font-extrabold text-[12px] uppercase tracking-[0.13em] px-5 py-3 cursor-pointer border-0 transition-colors"
      >
        {t("clearAll")}
      </button>
    </div>
  );
}
