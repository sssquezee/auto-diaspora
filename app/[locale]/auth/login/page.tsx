import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/Logo";
import { signInAction } from "../actions";
import { createClient } from "@/lib/supabase/server";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { TelegramLoginButton } from "@/components/TelegramLoginButton";

const fieldClass =
  "w-full border-[1.5px] border-line-strong bg-white px-3 py-2.5 font-sans text-[14px] text-ink outline-none focus:border-ink focus:border-2 focus:px-[11px] focus:py-[9px]";

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; notice?: string; next?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const sp = await searchParams;
  // Only honour internal paths to avoid open-redirect. Must start with a
  // single "/" (not "//" — that's a protocol-relative external URL).
  const next =
    sp?.next && sp.next.startsWith("/") && !sp.next.startsWith("//")
      ? sp.next
      : null;

  // Already logged in → go to the intended destination (or account).
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect(next ?? `/${locale}/account`);
  const t = await getTranslations("Auth");
  const tL = await getTranslations("Auth.login");
  const tErr = await getTranslations("Auth.errors");

  return (
    <div className="flex-1 flex items-center justify-center bg-bg px-6 py-12">
      <div className="w-full max-w-[400px] bg-white border-[1.5px] border-ink p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <Logo className="text-[22px] mb-5" />
          <h1 className="font-sans font-black text-[28px] uppercase tracking-[-0.03em] text-ink leading-none">
            {tL("title")}
          </h1>
          <p className="font-sans text-[13px] text-ink-muted mt-2">
            {tL("subtitle")}
          </p>
        </div>

        {sp?.notice === "check_email" && (
          <div
            role="status"
            className="bg-accent-soft border-l-[3px] border-accent p-3 mb-4 font-sans text-[13px] text-ink leading-relaxed"
          >
            {tL("noticeCheckEmail")}
          </div>
        )}

        {sp?.error && (
          <div
            role="alert"
            className="bg-white border-l-[3px] border-[#cf222e] p-3 mb-4 font-sans text-[13px] text-ink leading-relaxed"
          >
            {tErr(sp.error as "invalid_credentials" | "missing_fields" | "rate_limit" | "unknown")}
          </div>
        )}

        <form action={signInAction} className="flex flex-col gap-4">
          <input type="hidden" name="locale" value={locale} />
          {next && <input type="hidden" name="next" value={next} />}

          <div>
            <label
              htmlFor="email"
              className="block font-sans font-bold text-[10.5px] uppercase tracking-[0.1em] text-ink-muted mb-1.5"
            >
              {t("emailLabel")}
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

          <div>
            <div className="flex justify-between items-baseline mb-1.5">
              <label
                htmlFor="password"
                className="font-sans font-bold text-[10.5px] uppercase tracking-[0.1em] text-ink-muted"
              >
                {t("passwordLabel")}
              </label>
              <Link
                href="/auth/forgot"
                className="font-sans text-[11px] text-ink hover:text-accent underline decoration-accent decoration-1 underline-offset-2 no-underline"
              >
                {tL("forgotPassword")}
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className={fieldClass}
              required
            />
          </div>

          <button
            type="submit"
            className="mt-2 w-full bg-accent hover:bg-accent-2 text-white font-sans font-extrabold text-[13px] uppercase tracking-[0.13em] py-3.5 transition-colors cursor-pointer border-0"
          >
            {tL("submitButton")}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <span className="flex-1 h-px bg-line" />
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faded">
            {t("or")}
          </span>
          <span className="flex-1 h-px bg-line" />
        </div>

        <GoogleSignInButton label={t("googleButton")} locale={locale} next={next ?? undefined} />
        <TelegramLoginButton
          botUsername={process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME}
          locale={locale}
          next={next ?? undefined}
        />

        <p className="text-center font-sans text-[13px] text-ink-muted mt-6">
          {tL("noAccount")}{" "}
          <Link
            href={next ? `/auth/register?next=${encodeURIComponent(next)}` : "/auth/register"}
            className="text-ink font-bold no-underline hover:text-accent underline decoration-accent decoration-2 underline-offset-[3px]"
          >
            {tL("registerLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}
