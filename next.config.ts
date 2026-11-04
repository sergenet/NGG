import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ws-na.amazon-adsystem.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'images-na.ssl-images-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'postermasterstudio.com',
      },
      {
        protocol: 'https',
        hostname: 'theshadowgps.com',
      },
      {
        protocol: 'https',
        hostname: 'traverseon.com',
      },
      {
        protocol: 'https',
        hostname: 'order.grabo.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
      {
        protocol: 'https',
        hostname: 'www.dealgenius.com',
      },
    ],
  },
};

export default nextConfig;
