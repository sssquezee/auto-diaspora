"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminUserId } from "@/lib/admin";
import { routing } from "@/i18n/routing";
import {
  sendListingApprovedEmail,
  sendListingRejectedEmail,
} from "@/lib/email";

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
  const { data: updated } = await admin
    .from("listings")
    .update({ status: "active", updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "pending_review")
    .select("user_id, brand, model")
    .maybeSingle();

  if (updated) {
    const ownerEmail = await fetchOwnerEmail(admin, updated.user_id);
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
      "https://autodiaspora.com";
    if (ownerEmail) {
      await sendListingApprovedEmail({
        to: ownerEmail,
        listingTitle: `${updated.brand} ${updated.model}`,
        listingUrl: `${siteUrl}/${locale}/listing/${id}`,
      });
    }
  }

  revalidatePath(`/${locale}/admin/queue`);
  redirect(`/${locale}/admin/queue?action=approved`);
}

async function fetchOwnerEmail(
  admin: ReturnType<typeof createAdminClient>,
  userId: string
): Promise<string | null> {
  try {
    const { data } = await admin.auth.admin.getUserById(userId);
    return data.user?.email ?? null;
  } catch {
    return null;
  }
}

export async function rejectListingAction(formData: FormData) {
  const locale = pickLocale(formData.get("locale"));
  const id = pickUuid(formData.get("listing_id"));
  if (!id) redirect(`/${locale}/admin/queue`);

  const adminId = await getAdminUserId();
  if (!adminId) redirect(`/${locale}`);

  const admin = createAdminClient();

  // Snapshot owner + title BEFORE we delete the row, so we can email
  // the seller a heads-up after the cascade fires.
  const { data: snapshot } = await admin
    .from("listings")
    .select("user_id, brand, model")
    .eq("id", id)
    .maybeSingle();

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

  if (snapshot) {
    const ownerEmail = await fetchOwnerEmail(admin, snapshot.user_id);
    if (ownerEmail) {
      await sendListingRejectedEmail({
        to: ownerEmail,
        listingTitle: `${snapshot.brand} ${snapshot.model}`,
        reason: null,
      });
    }
  }

  revalidatePath(`/${locale}/admin/queue`);
  redirect(`/${locale}/admin/queue?action=rejected`);
}
