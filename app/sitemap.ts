// app/sitemap.ts
import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Replace this fallback with your actual live domain when deploying
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.studylite.online';

  // ==========================================
  // 1. STATIC ROUTES
  // ==========================================
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1.0, // Highest priority for the homepage
    },
    {
      url: `${baseUrl}/explore`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/community`,
      lastModified: new Date(),
      changeFrequency: 'daily', // Daily because users post often
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // ==========================================
  // 2. DYNAMIC ROUTES (From Prisma Database)
  // ==========================================
  // Fetch your community questions so Google can index them for organic search traffic!
  const questions = await prisma.communityQuestion.findMany({
    select: { id: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 5000, // Google allows up to 50,000 URLs per sitemap
  });

  const dynamicQuestionRoutes: MetadataRoute.Sitemap = questions.map((question) => ({
    url: `${baseUrl}/community/${question.id}`,
    lastModified: question.createdAt,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  // You can also do the same thing here for your Notes, Projects, or Public Profiles!

  // ==========================================
  // 3. COMBINE AND RETURN
  // ==========================================
  return [...staticRoutes, ...dynamicQuestionRoutes];
}