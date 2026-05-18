import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminUserId, adminListConfigured } from "@/lib/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();

  // Pretend the route doesn't exist when ADMIN_USER_IDS isn't set — keeps
  // public scanners from learning the surface.
  if (!adminListConfigured()) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  const adminId = await getAdminUserId();
  if (!adminId) notFound();

  const t = await getTranslations("Admin");

  // Counts in the side rail
  const { count: pendingCount } = await supabase
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending_review");
  const { count: openReportsCount } = await supabase
    .from("reports")
    .select("id", { count: "exact", head: true })
    .eq("status", "open");

  return (
    <div className="max-w-[1400px] w-full mx-auto px-6 py-6 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-5">
      <aside className="flex flex-col gap-3">
        <div className="bg-ink text-white px-4 py-3 font-sans font-extrabold text-[12px] tracking-[0.16em] uppercase">
          {t("title")}
        </div>
        <nav className="bg-white border-[1.5px] border-ink flex flex-col">
          <Link
            href="/admin/queue"
            className="flex items-center justify-between gap-3 px-4 py-3 no-underline font-sans text-[13px] font-semibold uppercase tracking-[0.06em] border-b border-line text-ink hover:bg-bg-subtle transition-colors"
          >
            <span>{t("nav.queue")}</span>
            {(pendingCount ?? 0) > 0 && (
              <span className="font-mono text-[10px] font-bold px-1.5 py-px bg-accent text-white">
                {pendingCount}
              </span>
            )}
          </Link>
          <Link
            href="/admin/reports"
            className="flex items-center justify-between gap-3 px-4 py-3 no-underline font-sans text-[13px] font-semibold uppercase tracking-[0.06em] text-ink hover:bg-bg-subtle transition-colors"
          >
            <span>{t("nav.reports")}</span>
            {(openReportsCount ?? 0) > 0 && (
              <span className="font-mono text-[10px] font-bold px-1.5 py-px bg-accent text-white">
                {openReportsCount}
              </span>
            )}
          </Link>
        </nav>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
