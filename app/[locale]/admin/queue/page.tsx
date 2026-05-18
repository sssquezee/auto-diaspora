import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  approveListingAction,
  rejectListingAction,
} from "./actions";

const STORAGE_BUCKET = "listings";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

type PendingRow = {
  id: string;
  user_id: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  country: string;
  city: string;
  description: string | null;
  created_at: string;
  profiles: { email: string; full_name: string | null } | null;
  listing_photos: Array<{ storage_path: string; position: number }> | null;
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default async function AdminQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string }>;
}) {
  const locale = await getLocale();
  const sp = await searchParams;
  const t = await getTranslations("Admin.queue");

  // Service-role client — admin sees all listings including pending
  const admin = createAdminClient();
  const { data: rows } = await admin
    .from("listings")
    .select(
      "id, user_id, brand, model, year, mileage, price, country, city, description, created_at, profiles(email, full_name), listing_photos(storage_path, position)"
    )
    .eq("status", "pending_review")
    .order("created_at", { ascending: true })
    .returns<PendingRow[]>();

  const items = rows ?? [];

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="font-sans font-black text-[28px] sm:text-[36px] uppercase tracking-[-0.04em] leading-none text-ink">
          {t("title")}
        </h1>
        <p className="font-sans text-[13px] text-ink-muted mt-2">
          {t("subtitle", { count: items.length })}
        </p>
      </header>

      {sp?.action === "approved" && (
        <div
          role="status"
          className="bg-accent-soft border-l-[3px] border-accent p-3 font-sans text-[13px] text-ink"
        >
          {t("approvedNotice")}
        </div>
      )}
      {sp?.action === "rejected" && (
        <div
          role="status"
          className="bg-white border-l-[3px] border-ink p-3 font-sans text-[13px] text-ink"
        >
          {t("rejectedNotice")}
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-white border-[1.5px] border-ink px-6 py-16 text-center">
          <p className="font-sans text-[14px] text-ink-muted">
            {t("empty")}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((row) => {
            const firstPhoto = (row.listing_photos ?? [])
              .slice()
              .sort((a, b) => a.position - b.position)[0];
            const photoUrl = firstPhoto
              ? `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${firstPhoto.storage_path}`
              : null;
            const ownerName =
              row.profiles?.full_name?.trim() ||
              row.profiles?.email?.split("@")[0] ||
              "—";

            return (
              <div
                key={row.id}
                className="bg-white border-[1.5px] border-ink flex flex-col sm:flex-row gap-0 overflow-hidden"
              >
                {/* Thumbnail */}
                <div className="sm:w-48 sm:flex-shrink-0 aspect-[4/3] sm:aspect-auto bg-bg-subtle relative overflow-hidden">
                  {photoUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={photoUrl}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <span className="absolute inset-0 grid place-items-center font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faded">
                      no photo
                    </span>
                  )}
                </div>

                {/* Meta */}
                <div className="flex-1 p-5 flex flex-col gap-2 min-w-0">
                  <div className="flex items-baseline justify-between gap-3 flex-wrap">
                    <Link
                      href={`/listing/${row.id}`}
                      className="font-sans font-black text-[18px] uppercase tracking-[-0.02em] text-ink no-underline hover:text-accent"
                    >
                      {row.brand} {row.model}
                    </Link>
                    <span className="font-mono text-[11px] text-ink-faded">
                      {timeAgo(row.created_at)}
                    </span>
                  </div>
                  <div className="font-mono text-[12px] text-ink-muted">
                    {row.year} · {row.mileage.toLocaleString()} km · €
                    {Number(row.price).toLocaleString()} · {row.city} (
                    {row.country})
                  </div>
                  {row.description && (
                    <p className="font-sans text-[13px] text-ink-muted leading-relaxed line-clamp-3">
                      {row.description}
                    </p>
                  )}
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faded mt-1">
                    {t("seller")}: {ownerName}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-3">
                    <form action={approveListingAction}>
                      <input type="hidden" name="listing_id" value={row.id} />
                      <input type="hidden" name="locale" value={locale} />
                      <button
                        type="submit"
                        className="bg-accent hover:bg-accent-2 text-white font-sans font-extrabold text-[12px] uppercase tracking-[0.13em] px-4 py-2 cursor-pointer border-0 transition-colors"
                      >
                        {t("approve")}
                      </button>
                    </form>
                    <form action={rejectListingAction}>
                      <input type="hidden" name="listing_id" value={row.id} />
                      <input type="hidden" name="locale" value={locale} />
                      <button
                        type="submit"
                        className="bg-white border-[1.5px] border-ink hover:bg-[#cf222e] hover:border-[#cf222e] hover:text-white text-ink font-sans font-extrabold text-[12px] uppercase tracking-[0.13em] px-4 py-2 cursor-pointer transition-colors"
                      >
                        {t("reject")}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
