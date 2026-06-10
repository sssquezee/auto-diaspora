"use client";

import { useState } from "react";

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

/**
 * "Continue with Google" button. Kicks off our self-hosted OAuth flow:
 * /api/auth/google → Google consent → /api/auth/google/callback
 * (which exchanges the code and mints a Supabase session server-side).
 *
 * Credentials live in env (GOOGLE_CLIENT_ID/SECRET) — no Supabase
 * dashboard provider config required.
 */
export function GoogleSignInButton({
  label,
  locale,
  next,
}: {
  label: string;
  locale: string;
  /** Optional internal path to return to after a successful login. */
  next?: string;
}) {
  const [loading, setLoading] = useState(false);

  const onClick = () => {
    setLoading(true);
    // Full-page navigation to the initiate route, which redirects to Google.
    const nextQs = next ? `&next=${encodeURIComponent(next)}` : "";
    window.location.href = `/api/auth/google?locale=${encodeURIComponent(
      locale
    )}${nextQs}`;
  };

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="w-full bg-white border-[1.5px] border-line-strong text-ink font-sans font-semibold text-[13px] py-3 cursor-pointer hover:border-ink transition-colors flex items-center justify-center gap-3 disabled:cursor-wait disabled:opacity-70"
      >
        <GoogleIcon />
        {label}
      </button>
    </>
  );
}
