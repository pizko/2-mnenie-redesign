import type { MetadataRoute } from 'next';
import { articles, specialists, articleModified } from '@/lib/data';
import { abs } from '@/lib/config';

export const dynamic = 'force-static';

/**
 * lastmod — только настоящая дата изменения (статьи: updated_at, документы: дата редакции).
 * Там, где источника даты нет (главная, разделы, врачи), lastmod не выводим,
 * вместо прежнего «текущего времени запроса».
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: abs('/') },
    { url: abs('/specialists') },
    { url: abs('/reviews') },
    { url: abs('/articles'), lastModified: articles.map(articleModified).sort().at(-1) },
    { url: abs('/dosages') },
    { url: abs('/documents/offer'), lastModified: '2026-08-14' },
    { url: abs('/documents/privacy'), lastModified: '2026-08-14' },
    { url: abs('/documents/disclaimer') },
    { url: abs('/documents/consent') },
    ...specialists.map((s) => ({ url: abs(`/specialists/${s.slug}`) })),
    ...articles.map((a) => ({ url: abs(`/articles/${a.slug}`), lastModified: articleModified(a) })),
  ];
}
