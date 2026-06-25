"use client";

/**
 * TEMPORARY diagnostic panel for Telegram Mini App login. Renders the live
 * state of window.Telegram.WebApp plus the result of one initData POST, so we
 * can see on the device exactly where the flow breaks. REMOVE once fixed.
 */

import { useEffect, useState } from "react";

export function TelegramDebug({ locale }: { locale: string }) {
  const [lines, setLines] = useState<string[]>(["reading…"]);
  const [serverResult, setServerResult] = useState<string>("(not called)");

  useEffect(() => {
    let posted = false;

    const read = () => {
      const w = window as unknown as {
        Telegram?: {
          WebApp?: {
            initData?: string;
            initDataUnsafe?: { user?: unknown };
            platform?: string;
            version?: string;
            ready?: () => void;
          };
        };
      };
      const tg = w.Telegram?.WebApp;
      const initData = tg?.initData ?? "";

      setLines([
        `window.Telegram: ${typeof w.Telegram}`,
        `WebApp: ${tg ? "present" : "MISSING"}`,
        `platform: ${tg?.platform ?? "-"}`,
        `version: ${tg?.version ?? "-"}`,
        `initData length: ${initData.length}`,
        `unsafe.user: ${tg?.initDataUnsafe?.user ? "present" : "none"}`,
        `location.hash length: ${window.location.hash.length}`,
      ]);

      // Once we actually have initData, hit the server once and show the code.
      if (tg && initData && !posted) {
        posted = true;
        tg.ready?.();
        fetch("/api/auth/telegram/miniapp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ initData, locale }),
        })
          .then(async (res) => {
            const text = await res.text();
            setServerResult(`HTTP ${res.status} — ${text.slice(0, 200)}`);
          })
          .catch((e) => setServerResult(`fetch error: ${String(e)}`));
      }
    };

    read();
    const id = window.setInterval(read, 500);
    return () => window.clearInterval(id);
  }, [locale]);

  return (
    <pre
      style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}
      className="mt-4 border-2 border-[#cf222e] bg-[#fff3cd] p-3 font-mono text-[11px] leading-relaxed text-black"
    >
      {`=== TG DEBUG (temporary) ===\n` +
        lines.join("\n") +
        `\n--- server ---\n` +
        serverResult}
    </pre>
  );
}
