import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  allowedDevOrigins: ["local-origin.dev", "*.local-origin.dev"],
};

export default nextConfig;
