import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { routing } from "@/i18n/routing";

const STATIC_PATHS = [
  "",
  "/about",
  "/how-it-works",
  "/terms",
  "/privacy",
] as const;

function languagesFor(siteUrl: string, path: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const l of routing.locales) {
    out[l] = `${siteUrl}/${l}${path}`;
  }
  out["x-default"] = `${siteUrl}/${routing.defaultLocale}${path}`;
  return out;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  // 1. Static pages — one entry per locale, with hreflang alternates
  const staticEntries: MetadataRoute.Sitemap = routing.locales.flatMap(
    (locale) =>
      STATIC_PATHS.map((path) => ({
        url: `${siteUrl}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: path === "" ? 1.0 : 0.5,
        alternates: { languages: languagesFor(siteUrl, path) },
      }))
  );

  // 2. Active listings — public via RLS, anon read works
  let listingEntries: MetadataRoute.Sitemap = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("listings")
      .select("id, updated_at")
      .eq("status", "active")
      .order("bumped_at", { ascending: false })
      .limit(5000)
      .returns<Array<{ id: string; updated_at: string }>>();

    listingEntries = (data ?? []).flatMap((l) =>
      routing.locales.map((locale) => ({
        url: `${siteUrl}/${locale}/listing/${l.id}`,
        lastModified: new Date(l.updated_at),
        changeFrequency: "weekly" as const,
        priority: 0.7,
        alternates: {
          languages: languagesFor(siteUrl, `/listing/${l.id}`),
        },
      }))
    );
  } catch {
    // If the DB is unreachable, return at least the static surface.
  }

  return [...staticEntries, ...listingEntries];
}
