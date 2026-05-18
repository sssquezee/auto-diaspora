import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "./SettingsForm";

type ProfileRow = {
  email: string;
  full_name: string | null;
  phone: string | null;
  country: string | null;
  city: string | null;
  language: string | null;
};

export default async function SettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ notice?: string; error?: string; msg?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, full_name, phone, country, city, language")
    .eq("id", user.id)
    .single<ProfileRow>();

  const sp = await searchParams;
  const t = await getTranslations("Account.settings");

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="font-sans font-black text-[28px] sm:text-[36px] uppercase tracking-[-0.04em] leading-none text-ink">
          {t("title")}
        </h1>
      </header>

      {sp?.notice === "saved" && (
        <div
          role="status"
          className="bg-accent-soft border-l-[3px] border-accent p-3 font-sans text-[13px] text-ink leading-relaxed"
        >
          {t("noticeSaved")}
        </div>
      )}

      {sp?.error && (
        <div
          role="alert"
          className="bg-white border-l-[3px] border-[#cf222e] p-3 font-sans text-[13px] text-ink leading-relaxed"
        >
          {sp.error === "confirm_mismatch"
            ? t("danger.confirmMismatch")
            : t("genericError")}
          {sp.msg && (
            <span className="block font-mono text-[11px] text-ink-muted mt-1 break-words">
              {sp.msg}
            </span>
          )}
        </div>
      )}

      <SettingsForm
        locale={locale}
        email={profile?.email ?? user.email ?? ""}
        defaults={{
          full_name: profile?.full_name ?? "",
          phone: profile?.phone ?? "",
          country: profile?.country ?? "",
          city: profile?.city ?? "",
          language: profile?.language ?? locale,
        }}
      />
    </div>
  );
}
