"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { ListingFormBody, type ListingDefaults } from "@/components/ListingFormBody";
import { updateListingAction } from "@/app/[locale]/account/listings/actions";

type Props = {
  listingId: string;
  locale: string;
  defaults: ListingDefaults;
};

export function EditListingForm({ listingId, locale, defaults }: Props) {
  const t = useTranslations("EditListing");
  const tErr = useTranslations("NewListing.errors");
  const searchParams = useSearchParams();
  const submitError = searchParams.get("error");
  const errorMsg = searchParams.get("msg");

  return (
    <>
      {submitError && (
        <div
          role="alert"
          className="bg-white border-l-[3px] border-[#cf222e] p-3 mb-4 font-sans text-[13px] text-ink leading-relaxed"
        >
          {tErr(
            submitError as
              | "missing_fields"
              | "server"
              | "moderation_stop_word"
              | "moderation_external_url"
          )}
          {errorMsg && submitError === "server" && (
            <span className="block font-mono text-[11px] text-ink-muted mt-1 break-words">
              {errorMsg}
            </span>
          )}
        </div>
      )}

      <form action={updateListingAction} className="flex flex-col gap-4">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="listing_id" value={listingId} />

        <ListingFormBody defaults={defaults} />

        <p className="font-mono text-[11px] text-ink-faded leading-relaxed">
          {t("photosNote")}
        </p>

        <div className="sticky bottom-3 z-10 mt-2">
          <button
            type="submit"
            className="w-full bg-accent hover:bg-accent-2 text-white font-sans font-extrabold text-[14px] uppercase tracking-[0.14em] py-4 transition-all cursor-pointer border-[1.5px] border-ink shadow-[3px_3px_0_var(--ink)] hover:shadow-[6px_6px_0_var(--ink)] hover:-translate-x-[3px] hover:-translate-y-[3px]"
          >
            {t("save")}
          </button>
        </div>
      </form>
    </>
  );
}
