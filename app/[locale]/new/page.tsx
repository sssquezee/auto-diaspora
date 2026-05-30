"use client";

import { Suspense, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { PhotosUploader } from "@/components/PhotosUploader";
import { ListingFormBody } from "@/components/ListingFormBody";
import { createClient } from "@/lib/supabase/client";
import { createListingAction } from "./actions";

function TierCard({
  active,
  title,
  price,
  desc,
  value,
}: {
  active?: boolean;
  title: string;
  price: string;
  desc: string;
  value: string;
}) {
  return (
    <label
      className={`relative flex flex-col gap-2 border-[1.5px] p-4 cursor-pointer transition-all ${
        active
          ? "border-ink shadow-[3px_3px_0_var(--accent)]"
          : "border-line-strong hover:border-ink"
      }`}
    >
      <input
        type="radio"
        name="tier"
        value={value}
        defaultChecked={active}
        className="absolute top-3 right-3 w-3.5 h-3.5 accent-[#0052ff]"
      />
      <div className="font-sans font-extrabold text-[13px] uppercase tracking-[0.08em] text-ink pr-7">
        {title}
      </div>
      <div className="font-mono font-bold text-[22px] text-ink tracking-[-0.02em]">
        {price}
      </div>
      <div className="font-sans text-[12px] text-ink-muted leading-relaxed">
        {desc}
      </div>
    </label>
  );
}

function SectionCard({
  index,
  title,
  children,
}: {
  index: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white border-[1.5px] border-ink">
      <header className="flex items-center gap-3 border-b border-line px-5 py-3">
        <span className="bg-ink text-white font-mono font-bold text-[12px] w-7 h-7 grid place-items-center">
          {String(index).padStart(2, "0")}
        </span>
        <h2 className="font-sans font-extrabold text-[14px] uppercase tracking-[0.12em] text-ink">
          {title}
        </h2>
      </header>
      <div className="p-5 flex flex-col gap-4">{children}</div>
    </section>
  );
}

function NewListingForm() {
  const t = useTranslations("NewListing");
  const tErr = useTranslations("NewListing.errors");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const submitError = searchParams.get("error");
  const errorMsg = searchParams.get("msg");

  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setUploadError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    if (files.length > 0) {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setSubmitting(false);
        setUploadError(t("errors.notAuthed"));
        return;
      }
      const listingId = crypto.randomUUID();
      const paths: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
        const path = `${user.id}/${listingId}/${i}.${ext}`;
        const { error } = await supabase.storage
          .from("listings")
          .upload(path, file, { upsert: false, contentType: file.type });
        if (error) {
          setSubmitting(false);
          setUploadError(`${t("errors.uploadFailed")}: ${error.message}`);
          return;
        }
        paths.push(path);
      }
      formData.append("listing_id", listingId);
      formData.append("photo_paths", JSON.stringify(paths));
    }

    await createListingAction(formData);
  };

  return (
    <div className="max-w-[860px] w-full mx-auto px-6 py-8">
      <header className="mb-6">
        <h1 className="font-sans font-black text-[36px] sm:text-[44px] uppercase tracking-[-0.04em] text-ink leading-none">
          {t("title")}
        </h1>
        <p className="font-sans text-[14px] text-ink-muted mt-2">
          {t("subtitle")}
        </p>
      </header>

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
              | "rate_limit"
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

        <ListingFormBody />

        {/* 5. Photos */}
        <SectionCard index={5} title={t("sections.photos")}>
          <PhotosUploader
            files={files}
            onChange={setFiles}
            labels={{
              dropzoneText: t("photosDropzone"),
              hintText: t("photosHint"),
              addMore: t("photosAddMore"),
              removeAria: t("photosRemove"),
              tooLarge: t("photosTooLarge"),
              notImage: t("photosNotImage"),
            }}
          />
        </SectionCard>

        {/* 6. Placement */}
        <SectionCard index={6} title={t("sections.premium")}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TierCard
              active
              value="free"
              title={t("tiers.free.title")}
              price={t("tiers.free.price")}
              desc={t("tiers.free.desc")}
            />
            <TierCard
              value="top"
              title={t("tiers.top.title")}
              price={t("tiers.top.price")}
              desc={t("tiers.top.desc")}
            />
          </div>
        </SectionCard>

        {/* Publish */}
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
            {submitting ? t("publishing") : t("publish")}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewListingPage() {
  return (
    <Suspense>
      <NewListingForm />
    </Suspense>
  );
}
