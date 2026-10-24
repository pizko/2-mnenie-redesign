import type { MetadataRoute } from 'next';
import { IS_PREVIEW, SITE_URL } from '@/lib/config';

export const dynamic = 'force-static';

// Публичные медиа врачей теперь лежат в /media/ — /api/ можно держать закрытым целиком.
export default function robots(): MetadataRoute.Robots {
  if (IS_PREVIEW) return { rules: { userAgent: '*', disallow: '/' } };
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/cabinet', '/login', '/telegram-login', '/register', '/api/'],
    },
    host: 'https://2-mnenie.ru',
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
