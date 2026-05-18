"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { routing } from "@/i18n/routing";

type Locale = (typeof routing.locales)[number];

function pickLocale(value: FormDataEntryValue | null): Locale {
  const v = typeof value === "string" ? value : "";
  return (routing.locales as readonly string[]).includes(v)
    ? (v as Locale)
    : (routing.defaultLocale as Locale);
}

function pickId(formData: FormData): string | null {
  const v = formData.get("listing_id");
  if (typeof v !== "string") return null;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)
    ? v
    : null;
}

export async function addFavoriteAction(formData: FormData) {
  const locale = pickLocale(formData.get("locale"));
  const listingId = pickId(formData);
  if (!listingId) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  // Upsert (insert that swallows the "already exists" PK conflict)
  await supabase
    .from("favorites")
    .upsert(
      { user_id: user.id, listing_id: listingId },
      { onConflict: "user_id,listing_id", ignoreDuplicates: true }
    );

  revalidatePath(`/${locale}/account/favorites`);
  revalidatePath(`/${locale}/account`);
}

export async function removeFavoriteAction(formData: FormData) {
  const locale = pickLocale(formData.get("locale"));
  const listingId = pickId(formData);
  if (!listingId) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  await supabase
    .from("favorites")
    .delete()
    .eq("user_id", user.id)
    .eq("listing_id", listingId);

  revalidatePath(`/${locale}/account/favorites`);
  revalidatePath(`/${locale}/account`);
}
