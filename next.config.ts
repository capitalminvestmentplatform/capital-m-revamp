import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "capital-m.s3.eu-north-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },

  reactStrictMode: false, // Disable Strict Mode
  devIndicators: false,
};

export default nextConfig;
