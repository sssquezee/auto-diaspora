"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { routing } from "@/i18n/routing";

type Locale = (typeof routing.locales)[number];

function pickLocale(value: FormDataEntryValue | null): Locale {
  const v = typeof value === "string" ? value : "";
  return (routing.locales as readonly string[]).includes(v)
    ? (v as Locale)
    : (routing.defaultLocale as Locale);
}

function str(formData: FormData, key: string, max: number): string {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

const COUNTRY_CODES = ["DE", "PL", "NL", "CZ", "BE", "FR"] as const;

export async function updateProfileAction(formData: FormData) {
  const submittedLocale = pickLocale(formData.get("locale"));

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${submittedLocale}/auth/login`);

  const full_name = str(formData, "full_name", 100) || null;
  const phone = str(formData, "phone", 32) || null;
  const city = str(formData, "city", 100) || null;
  const countryRaw = str(formData, "country", 4);
  const country = (COUNTRY_CODES as readonly string[]).includes(countryRaw)
    ? countryRaw
    : null;
  const languageRaw = str(formData, "language", 4);
  const language = (routing.locales as readonly string[]).includes(languageRaw)
    ? (languageRaw as Locale)
    : submittedLocale;

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name,
      phone,
      city,
      country,
      language,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    redirect(
      `/${submittedLocale}/account/settings?error=server&msg=${encodeURIComponent(
        error.message
      )}`
    );
  }

  revalidatePath(`/${language}/account`);
  // If the user changed UI language, route them to the new locale variant.
  redirect(`/${language}/account/settings?notice=saved`);
}

export async function deleteAccountAction(formData: FormData) {
  const locale = pickLocale(formData.get("locale"));

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  // Server-side double-check: client confirm dialog is bypassable
  const confirmText = String(formData.get("confirm") ?? "");
  if (confirmText !== "DELETE") {
    redirect(`/${locale}/account/settings?error=confirm_mismatch`);
  }

  // 1. Storage cleanup — list and remove all files under the user's prefix.
  //    Listing is recursive in supabase-js, so it returns the immediate
  //    children of <user_id>/ (each <listing_id> sub-folder). We then
  //    list each listing folder.
  const admin = createAdminClient();
  try {
    const { data: listingFolders } = await admin.storage
      .from("listings")
      .list(user.id, { limit: 1000 });
    if (listingFolders && listingFolders.length > 0) {
      const allPaths: string[] = [];
      for (const folder of listingFolders) {
        if (folder.name) {
          const { data: files } = await admin.storage
            .from("listings")
            .list(`${user.id}/${folder.name}`, { limit: 1000 });
          for (const f of files ?? []) {
            if (f.name) allPaths.push(`${user.id}/${folder.name}/${f.name}`);
          }
        }
      }
      if (allPaths.length > 0) {
        await admin.storage.from("listings").remove(allPaths);
      }
    }
  } catch {
    // Best-effort — DB cascade still wipes the row even if storage fails.
  }

  // 2. Delete the auth user. Cascades through profiles → listings → photos,
  //    favorites, chats, messages, saved_searches, payments, reports.
  await admin.auth.admin.deleteUser(user.id);

  // 3. Clear the cookie-bound session locally
  await supabase.auth.signOut();

  redirect(`/${locale}/?accountDeleted=1`);
}
