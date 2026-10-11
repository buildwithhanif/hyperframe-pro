import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Short links for DMs and bios that keep the source, so the page can say
  // where the visitor came from and taps can be counted per source.
  async redirects() {
    return [
      { source: "/dm", destination: "/v2?utm_source=dm", permanent: false },
      { source: "/ig", destination: "/v2?utm_source=ig_bio", permanent: false },
    ];
  },
};

export default nextConfig;
