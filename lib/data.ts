import specialistsRaw from '@/data/specialists.json';
import reviewsRaw from '@/data/reviews.json';
import articlesRaw from '@/data/articles.json';
import dosagesRaw from '@/data/dosages.json';
import legalRaw from '@/data/legal.json';
import mediaRaw from '@/data/media.json';
import specialistReviewsRaw from '@/data/specialist-reviews.json';
import { doctorProfiles, type DoctorProfile } from '@/content/doctors';

export type Media = { base: string; width: number; height: number; widths: number[] };

export type Review = {
  id: string;
  author_name: string;
  rating: number;
  text: string;
  created_at: string;
};

export type Certificate = {
  id: string;
  title: string;
  docType: string;
  alt: string;
  media: Media | null;
};

export type Specialist = {
  slug: string;
  name: string;
  /** Специализации без служебной метки «Другое» */
  tags: string[];
  bio: string;
  profile: DoctorProfile | null;
  practiceSince: number | null;
  photo: Media | null;
  certificates: Certificate[];
  reviews: { average: number; count: number; items: Review[] };
};

type RawSpecialist = (typeof specialistsRaw)[number];
const media = mediaRaw as Record<string, { photo: Media | null; certificates: (Media & { id: string })[] }>;
const perDoctorReviews = specialistReviewsRaw as Record<string, { average_rating: number; count: number; reviews: Review[] }>;

/** «С 2016», «с 2018г», «С 2014 года» → 2016 / 2018 / 2014. Пустое поле — стаж не показываем. */
export function parsePracticeSince(experience: string): number | null {
  const m = experience.match(/(19|20)\d{2}/);
  return m ? Number(m[0]) : null;
}

/** Стаж считаем полными календарными годами от года начала практики, указанного врачом в анкете. */
export function yearsOfPractice(since: number, now = new Date()) {
  return now.getFullYear() - since;
}

export function pluralRu(n: number, one: string, few: string, many: string) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

const fileLike = /^(img[_-]?\d+|screenshot|\d{6,}|dsc|photo)/i;

function toSpecialist(s: RawSpecialist): Specialist {
  const m = media[s.slug];
  const name = s.full_name.trim();
  const certificates = s.certificates.map((c, i) => {
    const title = c.title.trim();
    const meaningful = !fileLike.test(title) && !/стр\. \d+$/.test(title);
    return {
      id: c.id,
      title: meaningful ? title : `${c.doc_type[0].toUpperCase()}${c.doc_type.slice(1)} ${i + 1}`,
      docType: c.doc_type,
      alt: meaningful
        ? `${c.doc_type[0].toUpperCase()}${c.doc_type.slice(1)} «${title}» — ${name}`
        : `${c.doc_type[0].toUpperCase()}${c.doc_type.slice(1)} ${i + 1} из ${s.certificates.length} — ${name}`,
      media: m?.certificates.find((x) => x.id === c.id) ?? null,
    };
  });
  const r = perDoctorReviews[s.slug];
  return {
    slug: s.slug,
    name,
    tags: s.specialty
      .split('·')
      .map((t) => t.trim())
      .filter((t) => t && t !== 'Другое'),
    bio: s.short_bio.trim(),
    profile: doctorProfiles[s.slug] ?? null,
    practiceSince: parsePracticeSince(s.experience),
    photo: m?.photo ?? null,
    certificates,
    reviews: { average: r?.average_rating ?? 0, count: r?.count ?? 0, items: r?.reviews ?? [] },
  };
}

// Порядок как на боевом сайте (по-видимому, задан вручную в админке)
const ORDER = [
  'kabasheva-olga-aleksandrovna',
  'schetinina-natalya-yurevna',
  'sapelkin-ivan-vasilevich',
  'suhareva-anna-georgievna',
  'gandur-maksim-zhubran',
  'kuklina-nadezhda-alekseevna',
  'pushkin-artem-mihaylovich',
];

export const specialists: Specialist[] = specialistsRaw
  .map(toSpecialist)
  .sort((a, b) => (ORDER.indexOf(a.slug) + 1 || 99) - (ORDER.indexOf(b.slug) + 1 || 99));

export const getSpecialist = (slug: string) => specialists.find((s) => s.slug === slug);

export const reviews = {
  average: Number(reviewsRaw.average_rating),
  count: Number(reviewsRaw.count),
  items: reviewsRaw.reviews as Review[],
};

// ---------- Статьи ----------
type RawArticle = (typeof articlesRaw)[number];
export type Article = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  specialty: string;
  quickAnswer: string;
  expert: { name: string; specialty: string; slug: string; experience: string; quote: string } | null;
  sections: { id: string; heading: string; paragraphs: string[] }[];
  faq: { question: string; answer: string }[];
  sources: { title: string; url: string }[];
  cta: string;
  disclaimer: string;
  publishedAt: string;
  updatedAt: string;
};

function toArticle(a: RawArticle): Article {
  const p = a.payload as Record<string, any>;
  return {
    slug: a.slug,
    title: p.title ?? a.title,
    metaTitle: p.meta_title ?? a.title,
    metaDescription: p.meta_description ?? p.quick_answer ?? '',
    specialty: p.specialty ?? '',
    quickAnswer: p.quick_answer ?? '',
    expert: p.expert ?? null,
    sections: p.sections ?? [],
    faq: p.faq ?? [],
    sources: p.sources ?? [],
    cta: p.cta ?? '',
    disclaimer: p.disclaimer ?? '',
    publishedAt: a.published_at,
    updatedAt: a.updated_at,
  };
}

export const articles: Article[] = articlesRaw
  .filter((a) => a.status === 'published')
  .map(toArticle)
  .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

export const getArticle = (slug: string) => articles.find((a) => a.slug === slug);

/** Дата изменения статьи: updated_at, но не раньше даты публикации (в API updated_at бывает на доли секунды раньше). */
export const articleModified = (a: Article) => (a.updatedAt > a.publishedAt ? a.updatedAt : a.publishedAt);

// ---------- Справочник ----------
export type Dosage = (typeof dosagesRaw)[number];
export const dosages: Dosage[] = dosagesRaw;
export const SPECIES: Record<string, string> = {
  dogs: 'Собаки',
  cats: 'Кошки',
  ferrets: 'Хорьки',
  rodents: 'Грызуны',
  birds: 'Птицы',
  reptiles: 'Рептилии',
};

// ---------- Документы ----------
export type LegalDoc = { title: string; subtitle: string; edition: string; html: string };
export const legal = legalRaw as Record<'offer' | 'privacy' | 'disclaimer', LegalDoc>;

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Moscow' });
