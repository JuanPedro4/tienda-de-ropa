import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ISR: revalidate catalog pages on-demand via webhook
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },

  images: {
    // Cloudinary remote images
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },

  // Configure server actions
  serverExternalPackages: ["ioredis"],

  async rewrites() {
    return [
      {
        source: "/api/medusa/:path*",
        destination: `${process.env.MEDUSA_BACKEND_URL ?? "http://localhost:9000"}/:path*`,
      },
    ];
  },
};

export default nextConfig;
