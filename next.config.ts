import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Auth.js requires server-side external packages
  serverExternalPackages: ["@auth/drizzle-adapter"],

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lichess.org" },
    ],
  },

  // PWA headers for offline support
  headers: async () => [
    {
      source: "/sw.js",
      headers: [
        { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        { key: "Content-Type", value: "application/javascript; charset=utf-8" },
      ],
    },
  ],
};

export default nextConfig;
