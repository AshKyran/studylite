import type { NextConfig } from "next";

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

export default nextConfig;