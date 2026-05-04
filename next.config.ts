// next.config.ts
import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

// Configure the PWA wrapper
const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // Keeps dev mode fast
  register: true,
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gvtqwyvxtliklpooxrgk.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**', 
      },
      // Any other domains fetched avatars/thumbnails from (e.g., Google auth avatars)
    ],
  },
  // Optional but recommended for catching hydration errors early
  reactStrictMode: true, 
};

// Wrap your Next config with the PWA engine
export default withPWA(nextConfig);