"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { PhotosUploader } from "@/components/PhotosUploader";
import { ListingFormBody, type ListingDefaults } from "@/components/ListingFormBody";
import { createClient } from "@/lib/supabase/client";
import { track, getFunnelSessionId } from "@/lib/track";
import {
  loadDraft,
  saveDraft,
  clearDraft,
  markSubmitted,
  consumeSubmittedFlag,
  type DraftFields,
} from "@/lib/listing-draft";
import { createListingAction } from "./actions";

/** Coerce the flat string draft back into typed form defaults. */
function draftToDefaults(d: DraftFields): ListingDefaults {
  const numOrUndef = (v?: string) => {
    if (v == null || v === "") return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };
  return {
    brand: d.brand || undefined,
    model: d.model || undefined,
    year: numOrUndef(d.year),
    mileage: numOrUndef(d.mileage),
    fuel_type: d.fuel_type || undefined,
    transmission: d.transmission || undefined,
    body_type: d.body_type || undefined,
    drive_type: d.drive_type || undefined,
    engine_volume: numOrUndef(d.engine_volume),
    power_hp: numOrUndef(d.power_hp),
    color: d.color || undefined,
    vin: d.vin || undefined,
    country: d.country || undefined,
    city: d.city || undefined,
    condition: d.condition || undefined,
    customs: d.customs === "yes" ? "yes" : d.customs === "no" ? "no" : undefined,
    price: numOrUndef(d.price),
    price_negotiable: d.price_negotiable === "on",
    description: d.description || undefined,
  };
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

  // Check auth on mount so an unauthenticated visitor is told up-front that
  // publishing requires an account — instead of filling the whole form and
  // only hitting the wall at submit time. null = still checking.
  const [authed, setAuthed] = useState<boolean | null>(null);
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const isAuthed = !!data.user;
      setAuthed(isAuthed);
      // Funnel step 1: page opened. The authed flag is the key signal —
      // it tells us how many viewers were logged out at this point.
      track("new_view", { authed: isAuthed, locale });
    });
  }, [locale]);

  // Where to send the user back after they log in / register.
  const returnTo = encodeURIComponent(`/${locale}/new`);

  // Restore a saved draft so progress survives the login round-trip / reload.
  // Computed once on mount: if a previous submit succeeded (flag set + no
  // error on this load), the draft was published — discard it; otherwise
  // rehydrate the form from it.
  const [initialDefaults] = useState<ListingDefaults>(() => {
    const justSubmitted = consumeSubmittedFlag();
    if (justSubmitted && !submitError) {
      clearDraft();
      return {};
    }
    const d = loadDraft();
    return d ? draftToDefaults(d) : {};
  });

  // Debounced autosave of text fields on every change to the form.
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleFormChange = (e: React.FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const fd = new FormData(form);
      const draft: DraftFields = {};
      for (const [k, v] of fd.entries()) {
        // Skip non-draftable fields and file inputs.
        if (typeof v !== "string") continue;
        if (k === "locale" || k === "funnel_sid" || k === "photo_paths") continue;
        if (v !== "") draft[k] = v;
      }
      saveDraft(draft);
    }, 400);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    // At least one photo is required (also enforced server-side). Block here
    // with a clear message instead of a silent server bounce.
    if (files.length === 0) {
      setUploadError(t("errors.no_photos"));
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    setUploadError(null);

    // Funnel step 2: the user filled the form and pressed Publish.
    track("new_publish_click", { authed: authed ?? undefined, locale });

    // Mark the attempt so the draft is cleared once we confirm success
    // (i.e. next /new load with no error). Server bounces keep the draft.
    markSubmitted();

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Carry the anonymous funnel id so the server-side new_created /
    // new_submit_error events land in the same visit's funnel.
    const sid = getFunnelSessionId();
    if (sid) formData.append("funnel_sid", sid);

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

      {authed === false && (
        <div
          role="alert"
          className="bg-white border-[1.5px] border-ink shadow-[3px_3px_0_var(--accent)] p-4 mb-6 flex flex-col sm:flex-row sm:items-center gap-3"
        >
          <p className="font-sans text-[14px] text-ink leading-relaxed flex-1">
            {t("authPrompt.text")}
          </p>
          <div className="flex gap-2 shrink-0">
            <Link
              href={`/auth/login?next=${returnTo}`}
              className="bg-accent hover:bg-accent-2 text-white font-sans font-extrabold text-[12px] uppercase tracking-[0.12em] px-4 py-2.5 no-underline border-[1.5px] border-ink transition-colors"
            >
              {t("authPrompt.signIn")}
            </Link>
            <Link
              href={`/auth/register?next=${returnTo}`}
              className="bg-white hover:border-ink text-ink font-sans font-extrabold text-[12px] uppercase tracking-[0.12em] px-4 py-2.5 no-underline border-[1.5px] border-line-strong transition-colors"
            >
              {t("authPrompt.register")}
            </Link>
          </div>
        </div>
      )}

      {submitError && (
        <div
          role="alert"
          className="bg-white border-l-[3px] border-[#cf222e] p-3 mb-4 font-sans text-[13px] text-ink leading-relaxed"
        >
          {tErr(
            submitError as
              | "missing_fields"
              | "no_photos"
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

      <form onSubmit={handleSubmit} onChange={handleFormChange} className="flex flex-col gap-4">
        <input type="hidden" name="locale" value={locale} />

        <ListingFormBody defaults={initialDefaults} />

        {/* 3. Photos */}
        <SectionCard index={3} title={t("sections.photos")}>
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

        {/* Paid placement (TOP / Premium) is intentionally NOT shown here —
            publishing is free and one-click. The upsell is offered AFTER the
            listing is created, so the create flow never feels like it costs
            money. The listing is created with the implicit "free" tier. */}

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
