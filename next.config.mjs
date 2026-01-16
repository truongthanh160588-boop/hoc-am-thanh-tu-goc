import withPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure API routes use Node.js runtime for crypto
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

const pwaConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  fallbacks: {
    document: "/offline",
  },
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/www\.youtube\.com\/embed\/.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "youtube-videos",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
        },
      },
    },
    {
      urlPattern: /^https?:\/\/.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "offlineCache",
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24, // 1 day
        },
      },
    },
  ],
});

export default pwaConfig(nextConfig);
