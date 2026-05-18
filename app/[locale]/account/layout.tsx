import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { AccountNav } from "@/components/AccountNav";
import { createClient } from "@/lib/supabase/server";
import { getFavoritesCount } from "@/lib/favorites-server";

function initialsFrom(name: string | null | undefined, email: string): string {
  const source = (name && name.trim()) || email.split("@")[0];
  const parts = source.split(/\s+/).filter(Boolean);
  const chars =
    parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`
      : source.slice(0, 2);
  return chars.toUpperCase();
}

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = (await getLocale()) as "uk" | "ru" | "en";
  const t = await getTranslations("Account");

  // Gate: must be signed in
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  // Load profile (created by handle_new_user trigger on signup)
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, country, city, created_at")
    .eq("id", user.id)
    .single<{
      full_name: string | null;
      country: string | null;
      city: string | null;
      created_at: string;
    }>();

  const displayName =
    profile?.full_name?.trim() || user.email?.split("@")[0] || "—";
  const initials = initialsFrom(profile?.full_name, user.email ?? "");
  const country = profile?.country ?? "—";
  const city = profile?.city ?? "—";
  const memberSinceYear = profile?.created_at
    ? new Date(profile.created_at).getFullYear()
    : new Date().getFullYear();

  return (
    <div className="max-w-[1400px] w-full mx-auto px-6 py-6 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-5">
      <div className="flex flex-col gap-3">
        {/* User badge card */}
        <div className="bg-white border-[1.5px] border-ink p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-accent text-white grid place-items-center font-sans font-black text-[16px] flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="font-sans font-bold text-[14px] text-ink leading-tight truncate">
                {displayName}
              </div>
              <div className="font-mono text-[11px] text-ink-muted mt-0.5 flex items-center gap-1.5 truncate">
                <span className="bg-ink text-white text-[9px] font-bold px-1 py-px tracking-[0.04em]">
                  {country}
                </span>
                {city}
              </div>
            </div>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faded mt-3 pt-3 border-t border-line">
            {t("nav.memberSince", { year: memberSinceYear })}
          </div>
        </div>

        <AccountNav favoritesCount={await getFavoritesCount()} />
      </div>

      <div className="min-w-0">{children}</div>
    </div>
  );
}
