import type { Viewport } from "next";
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
  return children;
}
