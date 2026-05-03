import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lichess.org" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },

  // PWA headers for offline support
  headers: async () => [
    {
      source: "/sw.js",
      headers: [
        { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, proxy-revalidate" },
        { key: "Content-Type", value: "application/javascript; charset=utf-8" },
      ],
    },
  ],
};

export default nextConfig;
