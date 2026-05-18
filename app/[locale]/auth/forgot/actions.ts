"use server";

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

export async function requestPasswordResetAction(formData: FormData) {
  const locale = pickLocale(formData.get("locale"));
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    redirect(`/${locale}/auth/forgot?error=missing_fields`);
  }

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const redirectTo = `${siteUrl}/${locale}/auth/callback?next=/${locale}/auth/update-password`;

  // Supabase never reveals whether the email exists — always succeeds at
  // request level. We mirror that: show the "check your inbox" notice
  // unconditionally so account enumeration isn't possible.
  await supabase.auth.resetPasswordForEmail(email, { redirectTo });

  redirect(`/${locale}/auth/forgot?notice=sent`);
}
