import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PWA Configuration
  experimental: {
    // Enable experimental features if needed
  },
  
  // Headers for PWA
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
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Optimize for PWA
  compress: true,
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  
  // Enable static exports if needed
  // output: 'export',
  // trailingSlash: true,
};

export default nextConfig;
