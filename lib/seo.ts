import type { Metadata } from 'next';
import { IS_PREVIEW, abs } from './config';

/**
 * Уникальные title/description/canonical/OG для каждой страницы.
 * Раньше OG и twitter ряда разделов наследовали главную — теперь всё задаётся явно.
 */
export function pageMeta({
  title,
  description,
  path,
  image = '/og/default.png',
  imageAlt = 'Второе мнение — разбор ветеринарных документов врачом',
  type = 'website',
  noindex = false,
  absoluteTitle = false,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  imageAlt?: string;
  type?: 'website' | 'article' | 'profile';
  noindex?: boolean;
  absoluteTitle?: boolean;
}): Metadata {
  const url = abs(path);
  const fullTitle = absoluteTitle ? title : `${title} | Второе мнение`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    robots: IS_PREVIEW || noindex ? { index: false, follow: !IS_PREVIEW } : { index: true, follow: true },
    openGraph: {
      type,
      locale: 'ru_RU',
      siteName: 'Второе мнение',
      title: fullTitle,
      description,
      url,
      images: [{ url: abs(image), width: 1200, height: 630, alt: imageAlt }],
    },
    twitter: { card: 'summary_large_image', title: fullTitle, description, images: [abs(image)] },
  };
}

/** Обрезка до границы слова — для метаописаний из длинных текстов. */
export function clip(text: string, max = 158) {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:—–-]$/, '') + '…';
}
