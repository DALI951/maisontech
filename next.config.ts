import type { NextConfig } from "next";

// Set NEXT_BASE_PATH=/maisontech when the app is served from a sub-path
// (e.g. behind the Apache reverse proxy on modali.powerpme.com).
const basePath = process.env.NEXT_BASE_PATH?.replace(/\/$/, "") ?? "";

// Hosts allowed to submit Server Actions. Behind the Apache reverse proxy the
// Node process sees Host: 127.0.0.1:3187 while the browser sends the public
// origin, so the public host must be declared explicitly.
const actionOrigins = process.env.NEXT_ACTION_ORIGINS?.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  ...(actionOrigins && actionOrigins.length > 0
    ? { experimental: { serverActions: { allowedOrigins: actionOrigins } } }
    : {}),
  images: {
    // When real product photography is added, whitelist its host here and set
    // `imageUrl` on the product records. Until then the site renders local
    // vector illustrations (see src/components/product/product-visual.tsx).
    remotePatterns: [],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
