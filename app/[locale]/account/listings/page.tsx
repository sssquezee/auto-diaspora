import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ListingCard } from "@/components/ListingCard";
import { MyListingActions } from "@/components/MyListingActions";
import { createClient } from "@/lib/supabase/server";
import { getMyListings } from "@/lib/listings";
import { getFavoritesState } from "@/lib/favorites-server";

type StatusKey = "pending_review" | "active" | "paused" | "sold" | "expired";

const STATUS_KEYS: StatusKey[] = [
  "pending_review",
  "active",
  "paused",
  "sold",
  "expired",
];

export default async function MyListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; action?: string }>;
}) {
  const t = await getTranslations("Account.listings");
  const locale = await getLocale();
  const sp = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  const activeTab: StatusKey =
    sp?.status && (STATUS_KEYS as string[]).includes(sp.status)
      ? (sp.status as StatusKey)
      : "active";

  const [myListings, favState] = await Promise.all([
    getMyListings(user.id, activeTab),
    getFavoritesState(),
  ]);

  // Real status counts via separate small query
  const { data: statusRows } = await supabase
    .from("listings")
    .select("status")
    .eq("user_id", user.id);
  const counts: Record<string, number> = {};
  for (const r of (statusRows ?? []) as Array<{ status: string }>) {
    counts[r.status] = (counts[r.status] ?? 0) + 1;
  }

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-sans font-black text-[28px] sm:text-[36px] uppercase tracking-[-0.04em] leading-none text-ink">
          {t("title")}
        </h1>
        <Link
          href="/new"
          className="bg-ink hover:bg-accent text-white font-sans font-extrabold text-[12px] uppercase tracking-[0.13em] px-4 py-2.5 no-underline transition-colors"
        >
          {t("newButton")}
        </Link>
      </header>

      {/* Action result banner */}
      {sp?.action && (
        <ActionBanner action={sp.action} />
      )}

      {/* Tabs */}
      <div className="flex border-b-[1.5px] border-ink overflow-x-auto">
        {STATUS_KEYS.map((key) => {
          const isActive = activeTab === key;
          const count = counts[key] ?? 0;
          return (
            <Link
              key={key}
              href={key === "active" ? "/account/listings" : `/account/listings?status=${key}`}
              className={`flex items-center gap-2 px-4 py-2.5 font-sans font-bold text-[12px] uppercase tracking-[0.1em] no-underline whitespace-nowrap border-b-[3px] -mb-[1.5px] transition-colors ${
                isActive
                  ? "text-ink border-accent"
                  : "text-ink-muted border-transparent hover:text-ink"
              }`}
            >
              {t(`tabs.${key}`)}
              <span
                className={`font-mono text-[10px] px-1.5 py-px ${
                  isActive
                    ? "bg-accent text-white"
                    : "bg-bg-subtle text-ink-muted"
                }`}
              >
                {count}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Empty state */}
      {myListings.length === 0 ? (
        <div className="bg-white border-[1.5px] border-ink px-6 py-16 text-center">
          <p className="font-sans text-[14px] text-ink-muted max-w-md mx-auto leading-relaxed">
            {t(`empty.${activeTab}`)}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {await Promise.all(
            myListings.map(async (listing) => (
              <div key={listing.id} className="flex flex-col gap-2">
                <ListingCard
                  listing={listing}
                  isAuthed={favState.isAuthed}
                  isFavorite={favState.favoriteIds.has(listing.id)}
                />
                <MyListingActions
                  listingId={listing.id}
                  status={listing.status}
                  title={`${listing.brand} ${listing.model}`}
                />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

async function ActionBanner({ action }: { action: string }) {
  const t = await getTranslations("Account.listings.actionResult");
  const validKeys = ["paused", "active", "sold", "deleted", "error"];
  if (!validKeys.includes(action)) return null;

  const isError = action === "error";
  return (
    <div
      role="status"
      className={`p-3 font-sans text-[13px] leading-relaxed border-l-[3px] ${
        isError
          ? "bg-white border-[#cf222e] text-ink"
          : "bg-accent-soft border-accent text-ink"
      }`}
    >
      {t(action as "paused" | "active" | "sold" | "deleted" | "error")}
    </div>
  );
}
