import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFavoritesCount } from "@/lib/favorites-server";
import { getAdminUserId } from "@/lib/admin";
import { seedListingsAction } from "./dev-actions";

function StatCard({
  href,
  label,
  value,
  cta,
}: {
  href: string;
  label: string;
  value: React.ReactNode;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="block bg-white border-[1.5px] border-ink p-5 no-underline text-ink transition-all duration-150 hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-[6px_6px_0_var(--accent)]"
    >
      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">
        {label}
      </div>
      <div className="font-mono font-bold text-[36px] text-ink leading-none tracking-[-0.03em] my-3">
        {value}
      </div>
      <div className="font-sans font-bold text-[12px] uppercase tracking-[0.12em] text-accent">
        {cta}
      </div>
    </Link>
  );
}

export default async function AccountOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ seed?: string; count?: string; msg?: string }>;
}) {
  const t = await getTranslations("Account.overview");
  const tNav = await getTranslations("Account.nav");
  const tDev = await getTranslations("Account.dev");
  const locale = await getLocale();
  const sp = await searchParams;
  // Seed tool is available in dev, and to whitelisted admins in production
  // (so the owner can populate the live catalogue once).
  const isDev = process.env.NODE_ENV !== "production";
  const adminId = await getAdminUserId();
  const canSeed = isDev || adminId !== null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Layout already gates access, but Next still evaluates this page
  // in parallel — bail with zeroed stats if user resolved to null.
  let displayName = "—";
  let listingsCount: number | null = 0;
  let unreadCount: number | null = 0;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single<{ full_name: string | null }>();

    displayName =
      profile?.full_name?.trim().split(/\s+/)[0] ||
      user.email?.split("@")[0] ||
      "—";

    const [listings, messages] = await Promise.all([
      supabase
        .from("listings")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "active"),
      supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .is("read_at", null)
        .neq("sender_id", user.id),
    ]);
    listingsCount = listings.count;
    unreadCount = messages.count;
  }

  const favoritesCount = await getFavoritesCount();

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="font-sans font-black text-[36px] sm:text-[44px] uppercase tracking-[-0.04em] leading-none text-ink">
          {t("title", { name: displayName })}
        </h1>
        <p className="font-sans text-[14px] text-ink-muted mt-2">
          {t("subtitle")}
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard
          href="/account/listings"
          label={t("cards.listings")}
          value={listingsCount ?? 0}
          cta={tNav("listings") + " →"}
        />
        <StatCard
          href="/account/favorites"
          label={t("cards.favorites")}
          value={favoritesCount}
          cta={tNav("favorites") + " →"}
        />
        <StatCard
          href="/account/messages"
          label={t("cards.messages")}
          value={unreadCount ?? 0}
          cta={tNav("messages") + " →"}
        />
      </div>

      {/* Dev tools — seed catalog */}
      {canSeed && (
        <section className="bg-white border-[1.5px] border-dashed border-line-strong p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faded mb-1">
              {tDev("kicker")}
            </div>
            <p className="font-sans text-[13px] text-ink-muted leading-relaxed">
              {tDev("seedDescription")}
            </p>
            {sp?.seed === "ok" && (
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-accent mt-1.5">
                {tDev("seedOk", { count: Number(sp.count ?? 0) })}
              </p>
            )}
            {sp?.seed === "already_seeded" && (
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted mt-1.5">
                {tDev("seedAlready")}
              </p>
            )}
            {sp?.seed === "error" && (
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#cf222e] mt-1.5 break-words">
                {tDev("seedError")}: {sp.msg}
              </p>
            )}
          </div>
          <form action={seedListingsAction} className="flex-shrink-0">
            <input type="hidden" name="locale" value={locale} />
            <button
              type="submit"
              className="bg-ink hover:bg-accent text-white font-sans font-extrabold text-[12px] uppercase tracking-[0.13em] px-4 py-2.5 cursor-pointer border-0 transition-colors"
            >
              {tDev("seedButton")}
            </button>
          </form>
        </section>
      )}

    </div>
  );
}
