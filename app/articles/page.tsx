import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { articles, formatDate, articleModified } from '@/lib/data';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'Статьи для владельцев: диагноз, анализы, второе мнение',
  description:
    'Как читать анализы, когда перепроверять диагноз, что спросить у ветеринара и как подготовить документы — статьи с комментариями врачей сервиса.',
  path: '/articles',
  image: '/og/articles.png',
});

export default function ArticlesPage() {
  const [first, ...rest] = articles;
  return (
    <>
      <section className="wrap page-head">
        <Breadcrumbs items={[{ name: 'Статьи', href: '/articles' }]} />
        <p className="eyebrow">Статьи</p>
        <h1>Разобраться до решения</h1>
        <p className="lead">
          Материалы для владельцев: как подготовить документы, что спросить у врача и когда стоит перепроверить
          диагноз. Информация не заменяет очный приём.
        </p>
      </section>
      <section className="wrap">
        {first && (
          <Link href={`/articles/${first.slug}`} className="art-feature" data-reveal>
            <span className="eyebrow">{first.specialty} · новое</span>
            <span className="art-title">{first.title}</span>
            <span className="art-lead">{first.quickAnswer}</span>
            <span className="art-meta">
              <time dateTime={first.publishedAt}>{formatDate(first.publishedAt)}</time>
              {first.expert && <> · комментарий: {first.expert.name}</>}
            </span>
          </Link>
        )}
        <ul className="art-list">
          {rest.map((a, i) => (
            <li key={a.slug} data-reveal style={{ ['--d' as string]: i % 3 }}>
              <Link href={`/articles/${a.slug}`}>
                <span className="eyebrow">{a.specialty}</span>
                <span className="art-title">{a.title}</span>
                <span className="art-lead">{a.metaDescription}</span>
                <span className="art-meta">
                  <time dateTime={articleModified(a)}>{formatDate(a.publishedAt)}</time>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
