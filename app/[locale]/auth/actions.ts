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

function localePath(locale: Locale, path: string): string {
  // next-intl uses "as-needed" by default (no prefix for default locale),
  // but our routing config uses "always" — every locale gets a prefix.
  return `/${locale}${path.startsWith("/") ? path : `/${path}`}`;
}

// Only honour internal paths (single leading "/") so a crafted ?next= can't
// bounce the user to an external site after login.
function safeNext(value: FormDataEntryValue | null): string | null {
  const v = typeof value === "string" ? value : "";
  return v.startsWith("/") && !v.startsWith("//") ? v : null;
}

function authErrorKey(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login") || m.includes("invalid_credentials")) {
    return "invalid_credentials";
  }
  if (m.includes("already registered") || m.includes("already exists")) {
    return "email_taken";
  }
  if (m.includes("rate limit")) return "rate_limit";
  if (m.includes("password")) return "weak_password";
  if (m.includes("email")) return "invalid_email";
  return "unknown";
}

export async function signInAction(formData: FormData) {
  const locale = pickLocale(formData.get("locale"));
  const next = safeNext(formData.get("next"));
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    const nextQs = next ? `&next=${encodeURIComponent(next)}` : "";
    redirect(`${localePath(locale, "/auth/login")}?error=missing_fields${nextQs}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const nextQs = next ? `&next=${encodeURIComponent(next)}` : "";
    redirect(
      `${localePath(locale, "/auth/login")}?error=${authErrorKey(error.message)}${nextQs}`
    );
  }

  redirect(next ?? localePath(locale, "/account"));
}

export async function signUpAction(formData: FormData) {
  const locale = pickLocale(formData.get("locale"));
  const next = safeNext(formData.get("next"));
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const nextQs = next ? `&next=${encodeURIComponent(next)}` : "";

  if (!email || password.length < 8) {
    redirect(
      `${localePath(locale, "/auth/register")}?error=${
        password.length < 8 ? "weak_password" : "missing_fields"
      }${nextQs}`
    );
  }

  const supabase = await createClient();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  // Carry `next` through the email-confirmation link so the user lands back
  // on their intended page (e.g. /new) after clicking it. The callback route
  // reads ?next= and redirects there.
  const callbackPath = localePath(locale, "/auth/callback");
  const emailRedirectTo = next
    ? `${siteUrl}${callbackPath}?next=${encodeURIComponent(next)}`
    : `${siteUrl}${callbackPath}`;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo,
      data: {
        language: locale,
        full_name: fullName || undefined,
      },
    },
  });

  if (error) {
    redirect(
      `${localePath(locale, "/auth/register")}?error=${authErrorKey(error.message)}${nextQs}`
    );
  }

  // Supabase sends a confirmation email by default. Land on a "check inbox"
  // state on the login page (keeping `next` so a manual login also returns).
  redirect(`${localePath(locale, "/auth/login")}?notice=check_email${nextQs}`);
}

export async function signOutAction(formData: FormData) {
  const locale = pickLocale(formData.get("locale"));
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(localePath(locale, "/auth/login"));
}
