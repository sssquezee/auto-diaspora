"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminUserId } from "@/lib/admin";
import { routing } from "@/i18n/routing";

type Locale = (typeof routing.locales)[number];

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

export async function approveListingAction(formData: FormData) {
  const locale = pickLocale(formData.get("locale"));
  const id = pickUuid(formData.get("listing_id"));
  if (!id) redirect(`/${locale}/admin/queue`);

  const adminId = await getAdminUserId();
  if (!adminId) redirect(`/${locale}`);

  // Admin bypasses owner-RLS by using the service-role client
  const admin = createAdminClient();
  await admin
    .from("listings")
    .update({ status: "active", updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "pending_review");

  revalidatePath(`/${locale}/admin/queue`);
  redirect(`/${locale}/admin/queue?action=approved`);
}

export async function rejectListingAction(formData: FormData) {
  const locale = pickLocale(formData.get("locale"));
  const id = pickUuid(formData.get("listing_id"));
  if (!id) redirect(`/${locale}/admin/queue`);

  const adminId = await getAdminUserId();
  if (!adminId) redirect(`/${locale}`);

  const admin = createAdminClient();

  // Best-effort Storage cleanup before delete (CASCADE removes
  // listing_photos rows but leaves the actual files)
  const { data: photos } = await admin
    .from("listing_photos")
    .select("storage_path")
    .eq("listing_id", id);
  const paths = (photos ?? [])
    .map((p) => (p as { storage_path: string }).storage_path)
    .filter((p): p is string => typeof p === "string" && p.length > 0);
  if (paths.length > 0) {
    try {
      await admin.storage.from("listings").remove(paths);
    } catch {
      // best-effort
    }
  }

  // Delete the listing — RLS bypassed by service-role
  await admin.from("listings").delete().eq("id", id);

  revalidatePath(`/${locale}/admin/queue`);
  redirect(`/${locale}/admin/queue?action=rejected`);
}
