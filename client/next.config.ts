import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // تنظیمات برای پشتیبانی از Service Worker
  reactStrictMode: true,
  
  // هدرهای امنیتی
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
