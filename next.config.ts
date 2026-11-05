import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "192.168.31.176",
    "DESKTOP-EN261G1",
    "*.local",
    "*.internal",
    "*.google.internal",
    "*.googleusercontent.com",
    "*.cloudworkstations.dev",
    "*.preview.app.github.dev",
    "*.github.dev",
    "*.ngrok-free.app",
    "*.ngrok.io",
    "*.trycloudflare.com",
  ],
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
