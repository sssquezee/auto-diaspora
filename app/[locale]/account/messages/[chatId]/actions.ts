"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { routing } from "@/i18n/routing";
import { getReviewEligibility } from "@/lib/reviews";

type Locale = (typeof routing.locales)[number];

function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function getLocale(fd: FormData): Locale {
  const raw = str(fd, "locale");
  return (routing.locales as readonly string[]).includes(raw)
    ? (raw as Locale)
    : routing.defaultLocale;
}

const MAX_COMMENT = 1000;

export async function createReviewAction(formData: FormData) {
  const locale = getLocale(formData);
  const chatId = str(formData, "chat_id");
  const sellerId = str(formData, "seller_id");
  const listingId = str(formData, "listing_id");
  const ratingRaw = str(formData, "rating");
  const comment = str(formData, "comment").slice(0, MAX_COMMENT);

  const rating = Number.parseInt(ratingRaw, 10);
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    redirect(`/${locale}/account/messages/${chatId}?review=invalid`);
  }

  const elig = await getReviewEligibility({ sellerId, listingId });
  if (!elig.eligible) {
    redirect(`/${locale}/account/messages/${chatId}?review=${elig.reason}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("reviews").insert({
    seller_id: sellerId,
    buyer_id: elig.buyerId,
    listing_id: listingId,
    rating,
    comment: comment.length > 0 ? comment : null,
  });

  if (error) {
    // RLS-violation or unique-constraint hit (race) — surface generically.
    console.error("[reviews] insert failed:", error.message);
    redirect(`/${locale}/account/messages/${chatId}?review=server`);
  }

  revalidatePath(`/${locale}/u/${sellerId}`);
  revalidatePath(`/${locale}/account/messages/${chatId}`);
  redirect(`/${locale}/account/messages/${chatId}?review=ok`);
}
