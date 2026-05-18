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

export async function updatePasswordAction(formData: FormData) {
  const locale = pickLocale(formData.get("locale"));
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 8) {
    redirect(`/${locale}/auth/update-password?error=weak_password`);
  }
  if (password !== confirm) {
    redirect(`/${locale}/auth/update-password?error=mismatch`);
  }

  const supabase = await createClient();
  // Requires a recovery session (set by /auth/callback after email link click)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/forgot?error=unknown`);

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    const msg = error.message.toLowerCase();
    const key = msg.includes("password") ? "weak_password" : "unknown";
    redirect(`/${locale}/auth/update-password?error=${key}`);
  }

  redirect(`/${locale}/account?passwordUpdated=1`);
}
