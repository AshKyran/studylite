// app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.studylite.online';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Prevent Google from indexing private dashboard pages
      disallow: ['/dashboard/', '/api/', '/auth/', '/admin/', '/settings/', '/profile/', '/login/', '/register/', '/forgot-password/', '/update-password/'], 
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}