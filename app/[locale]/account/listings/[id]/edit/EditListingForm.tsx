"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { ListingFormBody, type ListingDefaults } from "@/components/ListingFormBody";
import {
  PhotosEditor,
  type ExistingPhoto,
} from "@/components/PhotosEditor";
import { createClient } from "@/lib/supabase/client";
import { updateListingAction } from "@/app/[locale]/account/listings/actions";

type Props = {
  listingId: string;
  locale: string;
  userId: string;
  existingPhotos: ExistingPhoto[];
  defaults: ListingDefaults;
};

export function EditListingForm({
  listingId,
  locale,
  userId,
  existingPhotos,
  defaults,
}: Props) {
  const t = useTranslations("EditListing");
  const tNew = useTranslations("NewListing");
  const tErr = useTranslations("NewListing.errors");
  const searchParams = useSearchParams();
  const submitError = searchParams.get("error");
  const errorMsg = searchParams.get("msg");

  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setUploadError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    // 1. Upload new photos to Storage under the listing's existing folder
    if (newFiles.length > 0) {
      const supabase = createClient();
      const newPaths: string[] = [];
      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i];
        const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
        const path = `${userId}/${listingId}/new-${Date.now()}-${i}.${ext}`;
        const { error } = await supabase.storage
          .from("listings")
          .upload(path, file, { upsert: false, contentType: file.type });
        if (error) {
          setSubmitting(false);
          setUploadError(`${tNew("errors.uploadFailed")}: ${error.message}`);
          return;
        }
        newPaths.push(path);
      }
      formData.append("new_photo_paths", JSON.stringify(newPaths));
    }

    // 2. Mark existing photos for deletion
    if (removedIds.size > 0) {
      formData.append(
        "removed_photo_ids",
        JSON.stringify(Array.from(removedIds))
      );
    }

    await updateListingAction(formData);
  };

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

      {uploadError && (
        <div
          role="alert"
          className="bg-white border-l-[3px] border-[#cf222e] p-3 mb-4 font-sans text-[13px] text-ink leading-relaxed break-words"
        >
          {uploadError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="listing_id" value={listingId} />

        <ListingFormBody defaults={defaults} />

        <section className="bg-white border-[1.5px] border-ink">
          <header className="flex items-center gap-3 border-b border-line px-5 py-3">
            <span className="bg-ink text-white font-mono font-bold text-[12px] w-7 h-7 grid place-items-center">
              05
            </span>
            <h2 className="font-sans font-extrabold text-[14px] uppercase tracking-[0.12em] text-ink">
              {tNew("sections.photos")}
            </h2>
          </header>
          <div className="p-5">
            <PhotosEditor
              existing={existingPhotos}
              removedIds={removedIds}
              onRemovedChange={setRemovedIds}
              files={newFiles}
              onFilesChange={setNewFiles}
              labels={{
                existingHeading: t("photosExisting"),
                newHeading: t("photosNew"),
                dropzoneText: tNew("photosDropzone"),
                hintText: tNew("photosHint"),
                addMore: tNew("photosAddMore"),
                removeAria: tNew("photosRemove"),
                undoRemove: t("photosUndoRemove"),
                tooLarge: tNew("photosTooLarge"),
                notImage: tNew("photosNotImage"),
              }}
            />
          </div>
        </section>

        <div className="sticky bottom-3 z-10 mt-2">
          <button
            type="submit"
            disabled={submitting}
            className={`w-full font-sans font-extrabold text-[14px] uppercase tracking-[0.14em] py-4 transition-all cursor-pointer border-[1.5px] border-ink ${
              submitting
                ? "bg-ink text-white cursor-wait"
                : "bg-accent hover:bg-accent-2 text-white shadow-[3px_3px_0_var(--ink)] hover:shadow-[6px_6px_0_var(--ink)] hover:-translate-x-[3px] hover:-translate-y-[3px]"
            }`}
          >
            {submitting ? tNew("publishing") : t("save")}
          </button>
        </div>
      </form>
    </>
  );
}
