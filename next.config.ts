import type { NextConfig } from "next";

/**
 * GitHub Pages project sites live at https://<user>.github.io/<repo>/
 * Set BASE_PATH=/<repo-name> when building for Pages (see CI workflow).
 * Local `npm run dev` keeps BASE_PATH empty.
 */
const rawBase = process.env.BASE_PATH?.trim() || "";
const basePath = rawBase === "/" ? "" : rawBase.replace(/\/$/, "");

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  ...(basePath
    ? {
        basePath,
        assetPrefix: basePath,
      }
    : {}),
};

export default nextConfig;
