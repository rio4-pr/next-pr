import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // อนุญาตให้โหลดรูปภาพจากโดเมนภายนอก
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // เปิด React Strict Mode
  reactStrictMode: true,

  // ตั้งค่า experimental features
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
};

export default nextConfig;
