import * as Sentry from "@sentry/nextjs";

// Auto-imported by Next.js (v13.4+). Loads the right Sentry config for
// each runtime. The edge import is dynamic so node-only deps don't get
// pulled into the edge bundle.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// Capture errors thrown from React Server Components, Server Actions,
// and Route Handlers automatically.
export const onRequestError = Sentry.captureRequestError;
