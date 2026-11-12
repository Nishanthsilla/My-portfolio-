import type { NextConfig } from "next";

// STATIC_EXPORT=1 produces a static build in out/ (used to make the single-file preview).
// Static export does not support partial prerendering, so those flags are off for it.
const staticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = staticExport
  ? { output: "export" }
  : {
      cacheComponents: true,
      partialPrefetching: true,
    };

export default nextConfig;
