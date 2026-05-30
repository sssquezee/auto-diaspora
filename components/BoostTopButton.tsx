"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type Props = {
  listingId: string;
  isTop: boolean;
  /** Visual size: "full" stretches (listing detail aside), "compact" inline (cards). */
  variant?: "full" | "compact";
};

/**
 * "Boost to top — €5" CTA. Render ONLY for the listing owner.
 * When the listing is already topped, shows a muted, non-clickable state.
 */
export function BoostTopButton({ listingId, isTop, variant = "full" }: Props) {
  const t = useTranslations("Boost");

  const base =
    variant === "full"
      ? "w-full justify-center px-4 py-3 text-[13px]"
      : "px-3 py-2 text-[11px]";

  if (isTop) {
    return (
      <span
        aria-disabled
        className={`inline-flex items-center gap-1.5 ${base} bg-bg-subtle border-[1.5px] border-line text-ink-faded font-sans font-bold uppercase tracking-[0.1em] cursor-not-allowed select-none`}
        title={t("alreadyTop")}
      >
        <Star />
        {t("alreadyTop")}
      </span>
    );
  }

  return (
    <Link
      href={`/new/payment?tier=top&listingId=${listingId}`}
      className={`inline-flex items-center gap-1.5 ${base} bg-accent hover:bg-accent-2 border-[1.5px] border-ink text-white font-sans font-bold uppercase tracking-[0.1em] no-underline transition-colors`}
    >
      <Star />
      {t("cta")}
    </Link>
  );
}

function Star() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
