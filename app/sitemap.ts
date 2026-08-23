import { MetadataRoute } from 'next';
import { createAdminClient } from '@/lib/supabase-server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://lazoo.vercel.app';

  // Base routes
  const routes = [
    '',
    '/auth/login',
    '/auth/register',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Fetch dynamic merchant profile pages to index them!
  try {
    const adminClient = createAdminClient();
    const { data: merchants } = await adminClient
      .from('profiles')
      .select('id, updated_at')
      .eq('role', 'merchant')
      .eq('is_active', true);

    if (merchants) {
      const merchantRoutes = merchants.map((m) => ({
        url: `${baseUrl}/client/merchant/${m.id}`,
        lastModified: m.updated_at ? new Date(m.updated_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }));
      return [...routes, ...merchantRoutes];
    }
  } catch (error) {
    console.error('Sitemap dynamic fetch failed:', error);
  }

  return routes;
}
