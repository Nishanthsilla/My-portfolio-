import type { NextConfig } from "next";

// STATIC_EXPORT=1 produces a static build in out/ (used to make the single-file preview).
// Static export does not support partial prerendering, so those flags are off for it.
// Server-only routes (The Wall's API) are named route.server.ts: the server build adds the
// "server.ts" extension so they are picked up; the static export has no server and skips them.
const staticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = staticExport
  ? { output: "export" }
  : {
      pageExtensions: ["tsx", "ts", "jsx", "js", "server.ts"],
      // the admin portal lives at /admin; its two old addresses open it on the matching tab
      async redirects() {
        return [
          { source: "/wall/admin", destination: "/admin", permanent: false },
          { source: "/access-admin", destination: "/admin?tab=notifications", permanent: false },
        ];
      },
      cacheComponents: true,
      partialPrefetching: true,
    };

export default nextConfig;
