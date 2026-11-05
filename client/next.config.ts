import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Auth + Supabase session reads (and DayPicker) use the current time.
  // Cache Components prerender fights that and breaks post-login navigations.
  cacheComponents: false,
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
