"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PromoteButton } from "@/components/PromoteButton";
import {
  pauseListingAction,
  resumeListingAction,
  markSoldAction,
  deleteListingAction,
} from "@/app/[locale]/account/listings/actions";

type Status = "active" | "paused" | "sold" | "expired" | "pending_review";

type Props = {
  listingId: string;
  status: Status | undefined;
  title: string;
  isTop: boolean;
  isPremium?: boolean;
};

export function MyListingActions({ listingId, status, title, isTop, isPremium = false }: Props) {
  const t = useTranslations("Account.listings.actions");
  const locale = useLocale();

  const confirmDelete = (e: React.FormEvent<HTMLFormElement>) => {
    const ok = window.confirm(t("confirmDelete", { title }));
    if (!ok) e.preventDefault();
  };

  const btn =
    "inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white border-[1.5px] border-ink hover:bg-ink hover:text-white text-ink font-sans font-bold text-[11px] uppercase tracking-[0.1em] cursor-pointer transition-colors";
  const danger =
    "inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white border-[1.5px] border-ink hover:bg-[#cf222e] hover:border-[#cf222e] hover:text-white text-ink font-sans font-bold text-[11px] uppercase tracking-[0.1em] cursor-pointer transition-colors";

  return (
    <div className="flex flex-wrap gap-1.5">
      {/* Edit — always available except for sold */}
      {status !== "sold" && (
        <Link
          href={`/account/listings/${listingId}/edit`}
          className={`${btn} no-underline`}
          title={t("edit")}
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
          </svg>
          {t("edit")}
        </Link>
      )}

      {/* Pause / Resume */}
      {status === "active" && (
        <form action={pauseListingAction}>
          <input type="hidden" name="listing_id" value={listingId} />
          <input type="hidden" name="locale" value={locale} />
          <button type="submit" className={btn} title={t("pause")}>
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden
            >
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
            {t("pause")}
          </button>
        </form>
      )}
      {status === "paused" && (
        <form action={resumeListingAction}>
          <input type="hidden" name="listing_id" value={listingId} />
          <input type="hidden" name="locale" value={locale} />
          <button type="submit" className={btn} title={t("resume")}>
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            {t("resume")}
          </button>
        </form>
      )}

      {/* Mark as sold — available for active and paused */}
      {(status === "active" || status === "paused") && (
        <form action={markSoldAction}>
          <input type="hidden" name="listing_id" value={listingId} />
          <input type="hidden" name="locale" value={locale} />
          <button type="submit" className={btn} title={t("markSold")}>
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {t("markSold")}
          </button>
        </form>
      )}

      {/* Promote — only meaningful while the listing is live */}
      {(status === "active" || status === "paused") && (
        <PromoteButton
          listingId={listingId}
          isTop={isTop}
          isPremium={isPremium}
          variant="compact"
        />
      )}

      {/* Delete — always available */}
      <form action={deleteListingAction} onSubmit={confirmDelete}>
        <input type="hidden" name="listing_id" value={listingId} />
        <input type="hidden" name="locale" value={locale} />
        <button type="submit" className={danger} title={t("delete")}>
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
          </svg>
          {t("delete")}
        </button>
      </form>
    </div>
  );
}
