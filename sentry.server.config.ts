import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Capture every server error in production; sample 10% of transactions.
  tracesSampleRate: 0.1,
  // Disable in dev so we don't pollute the project quota during local work.
  enabled: process.env.NODE_ENV === "production",
});
