import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { actionReportAction, dismissReportAction } from "./actions";

type ReportRow = {
  id: string;
  listing_id: string;
  reason: string;
  details: string | null;
  status: string;
  created_at: string;
  reporter: { full_name: string | null; email: string } | null;
  listing: {
    id: string;
    brand: string;
    model: string;
    year: number;
    price: number;
    country: string;
    city: string;
    status: string;
    user_id: string;
    listing_photos: Array<{ storage_path: string; position: number }> | null;
  } | null;
};

const STORAGE_BUCKET = "listings";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

function publicPhoto(path: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${path}`;
}

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

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; status?: string }>;
}) {
  const locale = await getLocale();
  const sp = await searchParams;
  const t = await getTranslations("Admin.reports");
  const tReasons = await getTranslations("Report.reasons");

  const filterStatus = sp?.status === "all" ? null : "open";

  const admin = createAdminClient();
  let query = admin
    .from("reports")
    .select(
      "id, listing_id, reason, details, status, created_at, " +
        "reporter:profiles!reports_reporter_id_fkey(full_name, email), " +
        "listing:listings(id, brand, model, year, price, country, city, status, user_id, listing_photos(storage_path, position))"
    )
    .order("created_at", { ascending: false })
    .limit(100);
  if (filterStatus) query = query.eq("status", filterStatus);
  const { data } = await query;
  const rows = (data ?? []) as unknown as ReportRow[];

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="font-sans font-black text-[28px] sm:text-[36px] uppercase tracking-[-0.04em] leading-none text-ink">
          {t("title")}
        </h1>
        <p className="font-sans text-[13px] text-ink-muted mt-2">
          {filterStatus === "open"
            ? t("subtitleOpen", { count: rows.length })
            : t("subtitleAll", { count: rows.length })}
        </p>
      </header>

      {sp?.action === "dismissed" && (
        <div
          role="status"
          className="bg-accent-soft border-l-[3px] border-accent p-3 font-sans text-[13px] text-ink"
        >
          {t("dismissedNotice")}
        </div>
      )}
      {sp?.action === "actioned" && (
        <div
          role="status"
          className="bg-accent-soft border-l-[3px] border-accent p-3 font-sans text-[13px] text-ink"
        >
          {t("actionedNotice")}
        </div>
      )}

      <nav className="flex gap-2 font-mono text-[11px] uppercase tracking-[0.1em]">
        <Link
          href={"/admin/reports"}
          className={`px-3 py-1.5 border-[1.5px] no-underline ${
            filterStatus === "open"
              ? "border-ink bg-ink text-white"
              : "border-line-strong text-ink-muted hover:border-ink hover:text-ink"
          }`}
        >
          {t("tabs.open")}
        </Link>
        <Link
          href={"/admin/reports?status=all"}
          className={`px-3 py-1.5 border-[1.5px] no-underline ${
            filterStatus === null
              ? "border-ink bg-ink text-white"
              : "border-line-strong text-ink-muted hover:border-ink hover:text-ink"
          }`}
        >
          {t("tabs.all")}
        </Link>
      </nav>

      {rows.length === 0 ? (
        <div className="bg-white border-[1.5px] border-dashed border-line-strong p-8 text-center font-sans text-[13px] text-ink-muted">
          {t("empty")}
        </div>
      ) : (
        <ul className="flex flex-col gap-3 list-none p-0 m-0">
          {rows.map((r) => {
            const primaryPhoto = (r.listing?.listing_photos ?? [])
              .slice()
              .sort((a, b) => a.position - b.position)[0];
            const reporterName =
              r.reporter?.full_name?.trim() ||
              r.reporter?.email?.split("@")[0] ||
              t("anonymousReporter");
            return (
              <li
                key={r.id}
                className="bg-white border-[1.5px] border-ink p-4 grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-4"
              >
                <Link
                  href={r.listing ? `/listing/${r.listing.id}` : "/admin/reports"}
                  className="block w-full sm:w-[120px] aspect-[4/3] border border-line bg-bg-subtle no-underline"
                >
                  {primaryPhoto && (
                    <img
                      src={publicPhoto(primaryPhoto.storage_path)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  )}
                </Link>

                <div className="flex flex-col gap-2 min-w-0">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span
                      className={`font-mono text-[10px] font-bold uppercase tracking-[0.14em] px-1.5 py-px ${
                        r.status === "open"
                          ? "bg-[#cf222e] text-white"
                          : r.status === "actioned"
                          ? "bg-ink text-white"
                          : "bg-bg-subtle text-ink-muted border border-line"
                      }`}
                    >
                      {t(`status.${r.status}`)}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted">
                      {tReasons(r.reason as never)}
                    </span>
                    <span className="font-mono text-[10px] text-ink-faded ml-auto">
                      {timeAgo(r.created_at)}
                    </span>
                  </div>

                  {r.listing ? (
                    <Link
                      href={`/listing/${r.listing.id}`}
                      className="font-sans font-extrabold text-[15px] text-ink no-underline hover:text-accent self-start"
                    >
                      {r.listing.brand} {r.listing.model} · {r.listing.year} ·{" "}
                      €{r.listing.price.toLocaleString()}
                    </Link>
                  ) : (
                    <span className="font-sans font-bold text-[14px] text-ink-faded">
                      {t("listingGone")}
                    </span>
                  )}

                  {r.details && (
                    <p className="font-sans text-[13px] text-ink-muted leading-relaxed m-0 whitespace-pre-wrap">
                      "{r.details}"
                    </p>
                  )}

                  <p className="font-mono text-[11px] text-ink-muted">
                    {t("reportedBy", { name: reporterName })}
                  </p>

                  {r.status === "open" && r.listing && (
                    <div className="flex gap-2 mt-2 pt-2 border-t border-line">
                      <form action={dismissReportAction}>
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="report_id" value={r.id} />
                        <button
                          type="submit"
                          className="border-[1.5px] border-ink bg-white hover:bg-ink hover:text-white text-ink font-sans font-extrabold text-[11px] uppercase tracking-[0.12em] px-4 py-2 cursor-pointer transition-colors"
                        >
                          {t("dismissCta")}
                        </button>
                      </form>
                      <form action={actionReportAction}>
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="report_id" value={r.id} />
                        <input
                          type="hidden"
                          name="listing_id"
                          value={r.listing.id}
                        />
                        <button
                          type="submit"
                          className="border-[1.5px] border-[#cf222e] bg-white hover:bg-[#cf222e] hover:text-white text-[#cf222e] font-sans font-extrabold text-[11px] uppercase tracking-[0.12em] px-4 py-2 cursor-pointer transition-colors"
                        >
                          {t("actionCta")}
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
