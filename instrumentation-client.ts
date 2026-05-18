import * as Sentry from "@sentry/nextjs";

// Browser runtime — Next.js auto-imports this file as the entry for the
// client-side Sentry SDK (since v15.3).
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  // Session replay disabled until we decide we want it — costs $$ on Sentry.
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  enabled: process.env.NODE_ENV === "production",
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
