import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase/server";
import { updatePasswordAction } from "./actions";

const fieldClass =
  "w-full border-[1.5px] border-line-strong bg-white px-3 py-2.5 font-sans text-[14px] text-ink outline-none focus:border-ink focus:border-2 focus:px-[11px] focus:py-[9px]";

export default async function UpdatePasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Must arrive via recovery session set by /auth/callback
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/forgot`);

  const sp = await searchParams;
  const t = await getTranslations("Auth.updatePassword");
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
            {t("subtitle", { email: user.email ?? "" })}
          </p>
        </div>

        {sp?.error && (
          <div
            role="alert"
            className="bg-white border-l-[3px] border-[#cf222e] p-3 mb-4 font-sans text-[13px] text-ink leading-relaxed"
          >
            {sp.error === "mismatch"
              ? t("mismatch")
              : tErr(sp.error as "weak_password" | "unknown")}
          </div>
        )}

        <form action={updatePasswordAction} className="flex flex-col gap-4">
          <input type="hidden" name="locale" value={locale} />

          <div>
            <label
              htmlFor="password"
              className="block font-sans font-bold text-[10.5px] uppercase tracking-[0.1em] text-ink-muted mb-1.5"
            >
              {t("newPasswordLabel")}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              className={fieldClass}
              required
              minLength={8}
            />
            <p className="font-mono text-[11px] text-ink-faded mt-1.5">
              {tAuth("register.passwordHint")}
            </p>
          </div>

          <div>
            <label
              htmlFor="confirm"
              className="block font-sans font-bold text-[10.5px] uppercase tracking-[0.1em] text-ink-muted mb-1.5"
            >
              {t("confirmLabel")}
            </label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              className={fieldClass}
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            className="mt-2 w-full bg-accent hover:bg-accent-2 text-white font-sans font-extrabold text-[13px] uppercase tracking-[0.13em] py-3.5 transition-colors cursor-pointer border-0"
          >
            {t("submitButton")}
          </button>
        </form>
      </div>
    </div>
  );
}
