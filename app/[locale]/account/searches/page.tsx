import { redirect } from "next/navigation";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { listSavedSearches } from "@/lib/saved-searches-server";
import { SavedSearchesList } from "@/components/SavedSearchesList";

export default async function SearchesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  const items = await listSavedSearches();

  const t = await getTranslations("Account.searches");

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="font-sans font-black text-[28px] sm:text-[36px] uppercase tracking-[-0.04em] leading-none text-ink">
          {t("title")}
        </h1>
        <p className="font-sans text-[13px] text-ink-muted mt-2">
          {t("subtitle")}
        </p>
      </header>

      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <SavedSearchesList
          items={items.map((s) => ({
            id: s.id,
            name: s.name,
            query: s.query,
            summary: s.summary ?? "",
            createdAt: s.created_at,
          }))}
          locale={locale}
          labels={{
            open: t("open"),
            remove: t("remove"),
            confirmRemove: t("confirmRemove"),
            createdAt: t("createdAt"),
          }}
        />
      )}
    </div>
  );
}

async function EmptyState() {
  const t = await getTranslations("Account.searches");
  return (
    <div className="bg-white border-[1.5px] border-ink px-6 py-16 text-center">
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mx-auto mb-4 text-ink-faded"
        aria-hidden
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <p className="font-sans text-[14px] text-ink-muted max-w-md mx-auto mb-5 leading-relaxed">
        {t("empty")}
      </p>
      <Link
        href="/search"
        className="inline-block bg-accent hover:bg-accent-2 text-white font-sans font-extrabold text-[12px] uppercase tracking-[0.13em] px-5 py-3 no-underline transition-colors"
      >
        {t("newButton")}
      </Link>
    </div>
  );
}
