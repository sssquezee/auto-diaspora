"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
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

/** Mark report dismissed — listing stays live. */
export async function dismissReportAction(formData: FormData) {
  const locale = pickLocale(formData.get("locale"));
  const id = pickUuid(formData.get("report_id"));
  if (!id) redirect(`/${locale}/admin/reports`);

  if (!(await getAdminUserId())) redirect(`/${locale}`);

  const admin = createAdminClient();
  await admin
    .from("reports")
    .update({ status: "dismissed" })
    .eq("id", id)
    .eq("status", "open");

  revalidatePath(`/${locale}/admin/reports`);
  redirect(`/${locale}/admin/reports?action=dismissed`);
}

/**
 * Action the report: delete the listing AND mark this + sibling reports
 * for the same listing as actioned. Storage cleanup is best-effort.
 */
export async function actionReportAction(formData: FormData) {
  const locale = pickLocale(formData.get("locale"));
  const id = pickUuid(formData.get("report_id"));
  const listingId = pickUuid(formData.get("listing_id"));
  if (!id || !listingId) redirect(`/${locale}/admin/reports`);

  if (!(await getAdminUserId())) redirect(`/${locale}`);

  const admin = createAdminClient();

  // Storage cleanup — same pattern as reject in queue/actions.ts
  const { data: photos } = await admin
    .from("listing_photos")
    .select("storage_path")
    .eq("listing_id", listingId);
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

  await admin.from("listings").delete().eq("id", listingId);

  // CASCADE on reports.listing_id deletes the rows automatically, but
  // do an explicit update first in case there are other open reports
  // for the same listing that survived (race).
  await admin
    .from("reports")
    .update({ status: "actioned" })
    .eq("listing_id", listingId)
    .eq("status", "open");

  revalidatePath(`/${locale}/admin/reports`);
  redirect(`/${locale}/admin/reports?action=actioned`);
}
