import type { Viewport } from "next";
import Script from "next/script";
import "./globals.css";

// Without this, mobile browsers render at desktop width and zoom out —
// every responsive breakpoint below is moot. This is the foundation.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/*
        Telegram Mini App SDK — loaded as early as possible (beforeInteractive,
        site-wide) so it captures the launch params (window.location hash /
        sessionStorage) on the very first page Telegram opens and keeps
        window.Telegram.WebApp.initData populated across navigations. Loading
        it only on the login page is too late: if the Mini App opens elsewhere
        first, the launch params are gone by the time the user reaches login.
      */}
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="beforeInteractive"
      />
      {children}
    </>
  );
}
