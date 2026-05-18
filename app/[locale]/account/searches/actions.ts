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

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function pickId(formData: FormData): string | null {
  const v = formData.get("id");
  if (typeof v !== "string") return null;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)
    ? v
    : null;
}

export async function addSavedSearchAction(formData: FormData) {
  const locale = pickLocale(formData.get("locale"));

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  const name = str(formData, "name").slice(0, 100) || "Untitled";
  const query = str(formData, "query").slice(0, 500);
  const summary = str(formData, "summary").slice(0, 500) || null;

  // If user already has this exact query saved → just refresh, no insert.
  const { data: existing } = await supabase
    .from("saved_searches")
    .select("id")
    .eq("user_id", user.id)
    .eq("query", query)
    .maybeSingle();

  if (!existing) {
    await supabase.from("saved_searches").insert({
      user_id: user.id,
      name,
      query,
      summary,
    });
  }

  revalidatePath(`/${locale}/account/searches`);
  // Stay on the page that triggered this — Server Actions called from client
  // forms re-render the originating route automatically.
}

export async function removeSavedSearchAction(formData: FormData) {
  const locale = pickLocale(formData.get("locale"));
  const id = pickId(formData);
  if (!id) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  await supabase
    .from("saved_searches")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath(`/${locale}/account/searches`);
}
