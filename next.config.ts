import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets a `next dev` run beside `next build` without sharing .next.
  distDir: process.env.NEXT_DIST_DIR || ".next",
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
