"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PAID_TIERS, TIER_PRICES_EUR } from "@/lib/tiers";

type Props = {
  listingId: string;
  isTop: boolean;
  isPremium: boolean;
  /** Visual size: "full" stretches (listing detail aside), "compact" inline (cards). */
  variant?: "full" | "compact";
};

/**
 * "Promote — €5 / €9.99 / €19.99" CTA with a tier dropdown. Render ONLY
 * for the listing owner. When the listing has an active premium plan,
 * shows a muted "already promoted" state.
 */
export function PromoteButton({
  listingId,
  isTop,
  isPremium,
  variant = "full",
}: Props) {
  const t = useTranslations("Promote");
  const tTiers = useTranslations("NewListing.tiers");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const sizeClass =
    variant === "full"
      ? "w-full justify-center px-4 py-3 text-[13px]"
      : "px-3 py-2 text-[11px]";

  if (isPremium) {
    return (
      <span
        aria-disabled
        className={`inline-flex items-center gap-1.5 ${sizeClass} bg-bg-subtle border-[1.5px] border-line text-ink-faded font-sans font-bold uppercase tracking-[0.1em] cursor-not-allowed select-none`}
        title={t("alreadyPremium")}
      >
        <Star />
        {t("alreadyPremium")}
      </span>
    );
  }

  return (
    <div ref={containerRef} className={variant === "full" ? "relative w-full" : "relative inline-block"}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`inline-flex items-center gap-1.5 ${sizeClass} bg-accent hover:bg-accent-2 border-[1.5px] border-ink text-white font-sans font-bold uppercase tracking-[0.1em] cursor-pointer transition-colors`}
      >
        <Star />
        {isTop ? t("ctaUpgrade") : t("cta")}
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute z-20 mt-1 bg-white border-[1.5px] border-ink shadow-[3px_3px_0_var(--ink)] ${
            variant === "full" ? "left-0 right-0" : "right-0 min-w-[260px]"
          }`}
        >
          {PAID_TIERS.map((tier) => {
            // If listing is already topped, hide single-shot top (no point re-buying).
            if (isTop && tier === "top") return null;
            return (
              <Link
                key={tier}
                href={`/new/payment?tier=${tier}&listingId=${listingId}`}
                className="block px-4 py-3 no-underline border-b border-line last:border-b-0 hover:bg-bg-subtle"
                role="menuitem"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-sans font-extrabold text-[12px] uppercase tracking-[0.1em] text-ink">
                    {tTiers(`${tier}.title`)}
                  </span>
                  <span className="font-mono font-bold text-[13px] text-ink whitespace-nowrap">
                    €{TIER_PRICES_EUR[tier].toFixed(2)}
                  </span>
                </div>
                <p className="font-sans text-[11.5px] text-ink-muted leading-snug mt-1 m-0">
                  {tTiers(`${tier}.short`)}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Star() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
