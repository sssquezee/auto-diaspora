"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/Logo";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0 0 12 23z" fill="#34A853" />
      <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18A11.02 11.02 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.83z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" fill="#EA4335" />
    </svg>
  );
}

const fieldClass =
  "w-full border-[1.5px] border-line-strong bg-white px-3 py-2.5 font-sans text-[14px] text-ink outline-none focus:border-ink focus:border-2 focus:px-[11px] focus:py-[9px]";

export default function LoginPage() {
  const t = useTranslations("Auth");
  const tL = useTranslations("Auth.login");

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

        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex flex-col gap-4"
        >
          <div>
            <label
              htmlFor="email"
              className="block font-sans font-bold text-[10.5px] uppercase tracking-[0.1em] text-ink-muted mb-1.5"
            >
              {t("emailLabel")}
            </label>
            <input
              id="email"
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
              <button
                type="button"
                className="bg-transparent border-0 cursor-pointer font-sans text-[11px] text-ink hover:text-accent underline decoration-accent decoration-1 underline-offset-2"
              >
                {tL("forgotPassword")}
              </button>
            </div>
            <input
              id="password"
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

        <button
          type="button"
          className="w-full bg-white border-[1.5px] border-ink hover:bg-ink hover:text-white text-ink font-sans font-semibold text-[13px] py-3 cursor-pointer transition-colors flex items-center justify-center gap-3"
        >
          <GoogleIcon />
          {t("googleButton")}
        </button>

        <p className="text-center font-sans text-[13px] text-ink-muted mt-6">
          {tL("noAccount")}{" "}
          <Link
            href="/auth/register"
            className="text-ink font-bold no-underline hover:text-accent underline decoration-accent decoration-2 underline-offset-[3px]"
          >
            {tL("registerLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}
