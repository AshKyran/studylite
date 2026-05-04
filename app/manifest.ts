// app/manifest.ts
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'StudyLite Platform',
    short_name: 'StudyLite',
    description: 'The ultimate academic hub and research library.',
    start_url: '/dashboard',
    display: 'standalone', // This hides the browser URL bar!
    background_color: '#f8fafc',
    theme_color: '#4f46e5', // Indigo-600 to match your branding
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}