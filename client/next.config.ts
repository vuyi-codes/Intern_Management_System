import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Auth + Supabase session reads (and DayPicker) use the current time.
  // Cache Components prerender fights that and breaks post-login navigations.
  cacheComponents: false,
  // This machine's disk is slow; the Turbopack disk cache goes stale and
  // then reports real packages (like @base-ui/utils) as missing.
  experimental: {
    turbopackFileSystemCacheForDev: false,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
