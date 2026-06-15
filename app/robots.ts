import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'], // Забороняємо ботам індексувати адмінку та API
    },
    sitemap: 'https://enotsushi.kyiv.ua/sitemap.xml',
  };
}
