"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const CONSENT_KEY = "ad:cookie-consent";

export function CookieBanner() {
  const t = useTranslations("CookieBanner");
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(CONSENT_KEY);
      if (!stored) setShow(true);
    } catch {
      // localStorage may be blocked in private mode — show banner anyway
      setShow(true);
    }
  }, []);

  if (!show) return null;

  const accept = () => {
    try {
      window.localStorage.setItem(CONSENT_KEY, "accepted");
    } catch {
      // ignore
    }
    setShow(false);
  };

  return (
    <div
      role="dialog"
      aria-label={t("title")}
      className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-4 sm:bottom-4 sm:max-w-[420px] z-40 bg-ink text-white border-[1.5px] border-ink shadow-[6px_6px_0_var(--accent)] p-4"
    >
      <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-accent mb-1.5">
        {t("kicker")}
      </p>
      <h2 className="font-sans font-black text-[16px] uppercase tracking-[-0.02em] leading-none mb-2">
        {t("title")}
      </h2>
      <p className="font-sans text-[12.5px] text-white/75 leading-[1.5] mb-3">
        {t.rich("body", {
          link: (chunks) => (
            <Link
              href="/privacy"
              className="text-accent underline decoration-accent decoration-1 underline-offset-2 no-underline hover:opacity-80"
            >
              {chunks}
            </Link>
          ),
        })}
      </p>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={accept}
          className="bg-accent hover:bg-accent-2 text-white font-sans font-extrabold text-[12px] uppercase tracking-[0.13em] px-4 py-2.5 cursor-pointer border-0 transition-colors"
        >
          {t("accept")}
        </button>
      </div>
    </div>
  );
}
