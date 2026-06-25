"use client";

import { useEffect, useRef, useState } from "react";
import { TelegramLoginButton } from "./TelegramLoginButton";

/**
 * Telegram authentication entry point. Picks the right method for the
 * context:
 *
 *   - Inside a Telegram Mini App (window.Telegram.WebApp.initData present):
 *     auto-login via the initData flow. The Login Widget MUST NOT be used
 *     here — it redirects to oauth.telegram.org and gets bounced into the
 *     system browser, so the session never lands back in the Mini App.
 *
 *   - In a normal browser: render the official Login Widget (redirect mode),
 *     which works fine outside Telegram.
 */
export function TelegramAuth({
  botUsername,
  locale,
  next,
  connectingLabel,
  errorLabel,
}: {
  botUsername?: string;
  locale: string;
  next?: string;
  /** Localised "Signing in via Telegram…" text. */
  connectingLabel: string;
  /** Localised "Telegram sign-in failed" text. */
  errorLabel: string;
}) {
  // "checking" until the WebApp SDK has had a chance to populate initData.
  const [mode, setMode] = useState<"checking" | "miniapp" | "browser">(
    "checking"
  );
  const [failed, setFailed] = useState(false);
  const started = useRef(false);

  // Detect the Mini App context and, if present, auto-login once.
  useEffect(() => {
    if (started.current) return;

    const tryMiniApp = () => {
      const tg = (
        window as unknown as {
          Telegram?: { WebApp?: { initData?: string; ready?: () => void } };
        }
      ).Telegram?.WebApp;
      const initData = tg?.initData ?? "";

      if (!tg || !initData) return false; // not a Mini App context

      started.current = true;
      tg.ready?.();
      setMode("miniapp");

      void (async () => {
        try {
          const res = await fetch("/api/auth/telegram/miniapp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ initData, locale, next }),
          });
          const json: { ok?: boolean; redirect?: string } = await res
            .json()
            .catch(() => ({}));
          if (res.ok && json.ok) {
            // Full navigation so the server reads the fresh session cookie.
            window.location.href = json.redirect ?? `/${locale}/account`;
          } else {
            setFailed(true);
          }
        } catch {
          setFailed(true);
        }
      })();
      return true;
    };

    // The SDK script may load after this effect; retry briefly before
    // settling on the browser fallback.
    if (tryMiniApp()) return;

    let tries = 0;
    const id = window.setInterval(() => {
      tries += 1;
      if (tryMiniApp() || tries >= 20) {
        window.clearInterval(id);
        if (!started.current) setMode("browser");
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [locale, next]);

  return (
    <>
      {mode === "browser" && (
        <TelegramLoginButton
          botUsername={botUsername}
          locale={locale}
          next={next}
        />
      )}

      {mode === "miniapp" && (
        <p
          role="status"
          className="mt-3 text-center font-sans text-[13px] text-ink-muted"
        >
          {failed ? errorLabel : connectingLabel}
        </p>
      )}
    </>
  );
}
