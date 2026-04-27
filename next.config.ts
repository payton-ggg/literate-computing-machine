import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin(
  // Points to the request config — relative to the project root
  "./src/lib/i18n/request.ts",
);

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  basePath: isProd ? "/app" : "",

  async rewrites() {
    if (isProd) return [];

    return [
      {
        source: "/api/:path*",
        destination: "https://zernote.com/api/:path*",
      },
    ];
  },
};

export default withNextIntl(nextConfig);
