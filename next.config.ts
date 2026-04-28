import type { NextConfig } from "next";

// Marketing and the product Worker both ship Next.js apps under a single
// huozi.app zone. They split by path, but both want to serve assets at
// `/_next/static/*`. To avoid the route collision (browser asks for
// marketing's CSS hash → CF routes by prefix → lands on product's
// catch-all → 404), we prefix marketing's assets so they sit under a
// path that only marketing claims.
//
// Pair this with:
//   - the post-build step in `scripts/prefix-assets.mjs` that moves
//     `.open-next/assets/_next` to `.open-next/assets/marketing-static/_next`
//     so the Workers ASSETS binding can resolve them
//   - the `huozi.app/marketing-static/*` route in `wrangler.jsonc`
const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  assetPrefix: isProd ? "/marketing-static" : undefined,
};

export default nextConfig;
