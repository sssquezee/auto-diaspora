"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { routing } from "@/i18n/routing";

type Locale = (typeof routing.locales)[number];

const REASON_KEYS = ["spam", "scam", "wrong_info", "stolen", "duplicate", "other"] as const;
type ReasonKey = (typeof REASON_KEYS)[number];

function pickLocale(value: FormDataEntryValue | null): Locale {
  const v = typeof value === "string" ? value : "";
  return (routing.locales as readonly string[]).includes(v)
    ? (v as Locale)
    : (routing.defaultLocale as Locale);
}

function pickUuid(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value
  )
    ? value
    : null;
}

function pickReason(value: FormDataEntryValue | null): ReasonKey | null {
  if (typeof value !== "string") return null;
  return (REASON_KEYS as readonly string[]).includes(value)
    ? (value as ReasonKey)
    : null;
}

export async function reportListingAction(formData: FormData) {
  const locale = pickLocale(formData.get("locale"));
  const listingId = pickUuid(formData.get("listing_id"));
  const reason = pickReason(formData.get("reason"));
  const details = (() => {
    const v = formData.get("details");
    return typeof v === "string" ? v.trim().slice(0, 1000) : "";
  })();

  if (!listingId || !reason) {
    redirect(`/${locale}/listing/${listingId ?? ""}?report=error`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  await supabase.from("reports").insert({
    listing_id: listingId,
    reporter_id: user.id,
    reason,
    details: details || null,
  });

  redirect(`/${locale}/listing/${listingId}?report=sent`);
}
