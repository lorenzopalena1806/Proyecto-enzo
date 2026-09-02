import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/admin/', '/api/', '/suspended/', '/subscription-required/'],
    },
    sitemap: 'https://lazoo.com.ar/sitemap.xml',
  };
}
