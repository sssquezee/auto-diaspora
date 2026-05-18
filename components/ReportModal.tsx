"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { reportListingAction } from "@/app/[locale]/listing/[id]/actions";

const REASONS = ["spam", "scam", "wrong_info", "stolen", "duplicate", "other"] as const;
type Reason = (typeof REASONS)[number];

type Props = {
  listingId: string;
  isAuthed: boolean;
  triggerLabel: string;
};

export function ReportModal({ listingId, isAuthed, triggerLabel }: Props) {
  const t = useTranslations("Report");
  const locale = useLocale();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const handleOpen = () => {
    if (!isAuthed) {
      router.push("/auth/login");
      return;
    }
    setOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="bg-transparent text-ink-muted hover:text-accent cursor-pointer border-0 underline decoration-line decoration-1 underline-offset-2 font-mono text-[11px] uppercase tracking-[0.14em]"
      >
        {triggerLabel}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white border-[1.5px] border-ink max-w-[480px] w-full p-5"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-accent mb-1.5">
              {t("kicker")}
            </p>
            <h2 className="font-sans font-black text-[22px] uppercase tracking-[-0.03em] text-ink leading-none mb-3">
              {t("title")}
            </h2>
            <p className="font-sans text-[13px] text-ink-muted mb-4 leading-relaxed">
              {t("subtitle")}
            </p>

            <form action={reportListingAction} className="flex flex-col gap-3">
              <input type="hidden" name="listing_id" value={listingId} />
              <input type="hidden" name="locale" value={locale} />

              <div>
                <label className="block font-sans font-bold text-[10.5px] uppercase tracking-[0.1em] text-ink-muted mb-1.5">
                  {t("reasonLabel")}
                </label>
                <div className="flex flex-col gap-1.5">
                  {REASONS.map((r, i) => (
                    <label
                      key={r}
                      className="flex items-center gap-2 border-[1.5px] border-line-strong px-3 py-2 cursor-pointer text-[13px] hover:border-ink"
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={r}
                        defaultChecked={i === 0}
                        className="w-3.5 h-3.5 accent-[#0052ff]"
                        required
                      />
                      {t(`reasons.${r as Reason}`)}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-sans font-bold text-[10.5px] uppercase tracking-[0.1em] text-ink-muted mb-1.5">
                  {t("detailsLabel")}
                </label>
                <textarea
                  name="details"
                  rows={3}
                  maxLength={1000}
                  placeholder={t("detailsPlaceholder")}
                  className="w-full border-[1.5px] border-line-strong focus:border-ink focus:border-2 bg-white px-3 py-2 font-sans text-[13px] text-ink outline-none resize-y"
                />
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2.5 bg-white border-[1.5px] border-ink hover:bg-ink hover:text-white text-ink font-sans font-extrabold text-[12px] uppercase tracking-[0.12em] cursor-pointer transition-colors"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-accent hover:bg-accent-2 text-white font-sans font-extrabold text-[12px] uppercase tracking-[0.12em] cursor-pointer border-0 transition-colors"
                >
                  {t("submit")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
