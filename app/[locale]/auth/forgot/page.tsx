import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase/server";
import { requestPasswordResetAction } from "./actions";

const fieldClass =
  "w-full border-[1.5px] border-line-strong bg-white px-3 py-2.5 font-sans text-[14px] text-ink outline-none focus:border-ink focus:border-2 focus:px-[11px] focus:py-[9px]";

export default async function ForgotPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Already logged in — bounce home
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect(`/${locale}/account`);

  const sp = await searchParams;
  const t = await getTranslations("Auth.forgot");
  const tAuth = await getTranslations("Auth");
  const tErr = await getTranslations("Auth.errors");

  return (
    <div className="flex-1 flex items-center justify-center bg-bg px-6 py-12">
      <div className="w-full max-w-[400px] bg-white border-[1.5px] border-ink p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <Logo className="text-[22px] mb-5" />
          <h1 className="font-sans font-black text-[28px] uppercase tracking-[-0.03em] text-ink leading-none">
            {t("title")}
          </h1>
          <p className="font-sans text-[13px] text-ink-muted mt-2">
            {t("subtitle")}
          </p>
        </div>

        {sp?.notice === "sent" && (
          <div
            role="status"
            className="bg-accent-soft border-l-[3px] border-accent p-3 mb-4 font-sans text-[13px] text-ink leading-relaxed"
          >
            {t("noticeSent")}
          </div>
        )}

        {sp?.error && (
          <div
            role="alert"
            className="bg-white border-l-[3px] border-[#cf222e] p-3 mb-4 font-sans text-[13px] text-ink leading-relaxed"
          >
            {tErr(sp.error as "missing_fields" | "unknown")}
          </div>
        )}

        <form action={requestPasswordResetAction} className="flex flex-col gap-4">
          <input type="hidden" name="locale" value={locale} />

          <div>
            <label
              htmlFor="email"
              className="block font-sans font-bold text-[10.5px] uppercase tracking-[0.1em] text-ink-muted mb-1.5"
            >
              {tAuth("emailLabel")}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className={fieldClass}
              required
            />
          </div>

          <button
            type="submit"
            className="mt-2 w-full bg-accent hover:bg-accent-2 text-white font-sans font-extrabold text-[13px] uppercase tracking-[0.13em] py-3.5 transition-colors cursor-pointer border-0"
          >
            {t("submitButton")}
          </button>
        </form>

        <p className="text-center font-sans text-[13px] text-ink-muted mt-6">
          <Link
            href="/auth/login"
            className="text-ink font-bold no-underline hover:text-accent underline decoration-accent decoration-2 underline-offset-[3px]"
          >
            ← {t("backToLogin")}
          </Link>
        </p>
      </div>
    </div>
  );
}
