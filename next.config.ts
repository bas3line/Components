import type { NextConfig } from "next";

// GitHub Pages: the Pages workflow sets PAGES_BASE_PATH ("/Components") and gets a static
// export in out/. Locally it is unset, so dev, start and `npm run shots` run at the root.
const pagesBase = process.env.PAGES_BASE_PATH;

const nextConfig: NextConfig = {
  ...(pagesBase === undefined
    ? // Lets a `next dev` run beside `next build` without sharing .next.
      { distDir: process.env.NEXT_DIST_DIR || ".next" }
    : { output: "export", basePath: pagesBase, trailingSlash: true }),
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
