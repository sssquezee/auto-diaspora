import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  // Trust the nginx reverse proxy in front of us on the VPS (X-Forwarded-*).
  // Next runs on 127.0.0.1:3001; nginx terminates TLS for autodiaspora.com.
  images: {
    // Allow next/image to optimise Supabase Storage URLs. The wildcard
    // hostname covers every Supabase project we might point at via
    // NEXT_PUBLIC_SUPABASE_URL.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

export default withNextIntl(nextConfig);
