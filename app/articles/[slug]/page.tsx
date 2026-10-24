import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { BotCta } from '@/components/BotCta';
import { Faq } from '@/components/Faq';
import { JsonLd } from '@/components/JsonLd';
import { Picture } from '@/components/Picture';
import { articles, getArticle, getSpecialist, formatDate, articleModified } from '@/lib/data';
import { abs } from '@/lib/config';
import { pageMeta, clip } from '@/lib/seo';
import { service } from '@/content/service';

export const dynamicParams = false;
export const generateStaticParams = () => articles.map((a) => ({ slug: a.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const a = getArticle((await params).slug);
  if (!a) return {};
  return pageMeta({
    title: a.metaTitle,
    description: clip(a.metaDescription, 170),
    path: `/articles/${a.slug}`,
    image: '/og/articles.png',
    imageAlt: a.title,
    type: 'article',
  });
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const a = getArticle((await params).slug);
  if (!a) notFound();
  const expert = a.expert ? getSpecialist(a.expert.slug) : undefined;
  const modified = articleModified(a);
  const showUpdated = modified.slice(0, 10) !== a.publishedAt.slice(0, 10);
  const related = articles.filter((x) => x.slug !== a.slug).slice(0, 3);

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: a.title,
          description: a.metaDescription,
          datePublished: a.publishedAt,
          dateModified: modified,
          mainEntityOfPage: abs(`/articles/${a.slug}`),
          publisher: { '@type': 'Organization', name: 'Второе мнение', logo: { '@type': 'ImageObject', url: abs('/logo.jpg') } },
          // Врач указан как автор комментария; роль «проверяющего» не подтверждена — reviewedBy не ставим
          ...(a.expert && { contributor: { '@type': 'Person', name: a.expert.name, url: abs(`/specialists/${a.expert.slug}`) } }),
        }}
      />
      {a.faq.length > 0 && (
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: a.faq.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
          }}
        />
      )}
      <article className="wrap article">
        <Breadcrumbs items={[{ name: 'Статьи', href: '/articles' }, { name: a.title, href: `/articles/${a.slug}` }]} />
        <header className="article-head">
          <p className="eyebrow">{a.specialty}</p>
          <h1>{a.title}</h1>
          <p className="article-dates">
            Опубликовано <time dateTime={a.publishedAt}>{formatDate(a.publishedAt)}</time>
            {showUpdated && (
              <>
                {' '}
                · обновлено <time dateTime={modified}>{formatDate(modified)}</time>
              </>
            )}
          </p>
          {a.quickAnswer && (
            <div className="quick">
              <p className="quick-k">Коротко</p>
              <p>{a.quickAnswer}</p>
            </div>
          )}
        </header>

        <div className="article-grid">
          <aside className="toc" aria-label="Оглавление">
            <p className="toc-h">Содержание</p>
            <ol>
              {a.sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`}>{s.heading}</a>
                </li>
              ))}
              {a.expert && (
                <li>
                  <a href="#expert">Комментарий врача</a>
                </li>
              )}
              {a.faq.length > 0 && (
                <li>
                  <a href="#questions">Вопросы</a>
                </li>
              )}
              {a.sources.length > 0 && (
                <li>
                  <a href="#sources">Источники</a>
                </li>
              )}
            </ol>
          </aside>

          <div className="prose">
            {a.sections.map((s) => (
              <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`}>
                <h2 id={`${s.id}-h`}>{s.heading}</h2>
                {s.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </section>
            ))}

            {a.expert && (
              <section id="expert" className="expert" aria-labelledby="expert-h">
                <div className="expert-who">
                  {expert?.photo && (
                    <Picture media={expert.photo} alt={`${a.expert.name}, ветеринарный врач`} sizes="96px" className="expert-ph" aspect="1 / 1" />
                  )}
                  <div>
                    <p className="eyebrow">Комментарий врача</p>
                    <h2 id="expert-h">
                      <Link href={`/specialists/${a.expert.slug}`}>{a.expert.name}</Link>
                    </h2>
                    <p className="muted">{expert ? expert.tags.join(' · ') : a.expert.specialty}</p>
                  </div>
                </div>
                <blockquote>
                  <p>{a.expert.quote}</p>
                </blockquote>
              </section>
            )}

            <aside className="service-hint" aria-label="Услуга">
              <p className="eyebrow">Если нужен разбор вашего случая</p>
              <p>{a.cta || 'Врач изучит документы вашего питомца и подготовит письменное заключение.'}</p>
              <p className="fine">
                {service.priceLabel} · {service.turnaround} {service.turnaroundStart} · оформление в Telegram-боте
              </p>
              <BotCta source={`article_${a.slug}`.slice(0, 60)}>Оформить второе мнение</BotCta>
            </aside>

            {a.faq.length > 0 && (
              <section id="questions" aria-labelledby="q-h">
                <h2 id="q-h">Вопросы</h2>
                <Faq items={a.faq.map((f) => ({ q: f.question, a: f.answer }))} place={`article_${a.slug}`.slice(0, 60)} />
              </section>
            )}

            {a.sources.length > 0 && (
              <section id="sources" aria-labelledby="src-h" className="sources">
                <h2 id="src-h">Источники</h2>
                <ol>
                  {a.sources.map((s) => (
                    <li key={s.url}>
                      <a href={s.url} rel="noopener nofollow" target="_blank">
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </section>
            )}
            {a.disclaimer && <p className="fine disclaimer">{a.disclaimer}</p>}
          </div>
        </div>
      </article>
      <section className="wrap related" aria-labelledby="rel-h">
        <h2 id="rel-h">Читайте также</h2>
        <ul className="art-list">
          {related.map((r) => (
            <li key={r.slug}>
              <Link href={`/articles/${r.slug}`}>
                <span className="eyebrow">{r.specialty}</span>
                <span className="art-title">{r.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
