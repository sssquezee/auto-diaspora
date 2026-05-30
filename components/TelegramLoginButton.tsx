"use client";

import { useEffect, useRef } from "react";

/**
 * Renders Telegram's official Login Widget (redirect mode). On success
 * Telegram redirects the browser to /api/auth/telegram with the signed
 * payload, where we verify it and start a session.
 *
 * Renders nothing unless NEXT_PUBLIC_TELEGRAM_BOT_USERNAME is set. The
 * bot's domain must be registered with @BotFather (/setdomain) or the
 * widget refuses to load.
 */
export function TelegramLoginButton({
  botUsername,
  locale,
}: {
  botUsername?: string;
  locale: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container || !botUsername) return;
    container.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", botUsername);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "0");
    script.setAttribute(
      "data-auth-url",
      `${window.location.origin}/api/auth/telegram?locale=${locale}`
    );
    script.setAttribute("data-request-access", "write");
    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, [botUsername, locale]);

  if (!botUsername) return null;
  return <div ref={ref} className="flex justify-center mt-3" />;
}
