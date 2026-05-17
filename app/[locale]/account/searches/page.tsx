import { getTranslations, setRequestLocale } from "next-intl/server";
import { SavedSearchesList } from "@/components/SavedSearchesList";

export default async function SearchesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

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

      <SavedSearchesList
        labels={{
          empty: t("empty"),
          emptyCta: t("newButton"),
          open: t("open"),
          remove: t("remove"),
          confirmRemove: t("confirmRemove"),
          createdAt: t("createdAt"),
        }}
      />
    </div>
  );
}
