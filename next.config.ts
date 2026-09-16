import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 75 for the wall, 88 for the full-screen viewer.
    qualities: [75, 88],
    // Sources are AVIF; serve AVIF too, falling back to WebP.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
