import createIntlMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

export default async function middleware(req: NextRequest) {
  // 1. Let next-intl decide redirect / rewrite / locale headers
  const response = intlMiddleware(req);
  // 2. Refresh Supabase session on the SAME response so auth cookies stick
  return updateSession(req, response);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
