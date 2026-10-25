import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { LeadButton } from '@/components/LeadForm';
import { CertGallery } from '@/components/CertGallery';
import { Picture } from '@/components/Picture';
import { ReviewCard, Stars } from '@/components/ReviewCard';
import { ReviewForm } from '@/components/ReviewForm';
import { JsonLd } from '@/components/JsonLd';
import { getSpecialist, specialists, pluralRu, yearsOfPractice } from '@/lib/data';
import { abs } from '@/lib/config';
import { pageMeta, clip } from '@/lib/seo';
import { service } from '@/content/service';

export const dynamicParams = false;
export const generateStaticParams = () => specialists.map((s) => ({ slug: s.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const s = getSpecialist((await params).slug);
  if (!s) return {};
  return pageMeta({
    title: `${s.name} — ${s.tags.join(', ').toLowerCase()}`,
    // Отдельное краткое описание вместо полной биографии (раньше в description попадало до ~2 900 символов)
    description: s.profile?.metaDescription ?? clip(`${s.name}. ${s.bio}`),
    path: `/specialists/${s.slug}`,
    image: `/og/specialist-${s.slug}.png`,
    imageAlt: `${s.name}, ветеринарный врач`,
    type: 'profile',
  });
}

export default async function SpecialistPage({ params }: { params: Promise<{ slug: string }> }) {
  const s = getSpecialist((await params).slug);
  if (!s) notFound();
  const p = s.profile;
  const years = s.practiceSince ? yearsOfPractice(s.practiceSince) : null;
  const sections = [
    p?.education?.length && { id: 'education', title: 'Образование', items: p.education },
    p?.career?.length && { id: 'career', title: 'Опыт работы', items: p.career },
    p?.training?.length && { id: 'training', title: 'Повышение квалификации', items: p.training },
  ].filter(Boolean) as { id: string; title: string; items: string[] }[];

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: s.name,
          jobTitle: `Ветеринарный врач: ${s.tags.join(', ').toLowerCase()}`,
          url: abs(`/specialists/${s.slug}`),
          image: s.photo ? abs(`${s.photo.base}-640.webp`) : undefined,
          knowsLanguage: p?.languages,
          worksFor: { '@type': 'Organization', name: 'Второе мнение', url: abs('/') },
        }}
      />
      <article className="wrap doctor">
        <Breadcrumbs items={[{ name: 'Врачи', href: '/specialists' }, { name: s.name, href: `/specialists/${s.slug}` }]} />
        <header className="doctor-head">
          <div className="doctor-photo">
            {s.photo && (
              <Picture media={s.photo} alt={`${s.name}, ветеринарный врач`} sizes="(max-width: 768px) 92vw, 380px" priority aspect="4 / 5" />
            )}
          </div>
          <div className="doctor-intro">
            <p className="eyebrow">{s.tags.join(' · ')}</p>
            <h1>{s.name}</h1>
            {p?.lead && <p className="lead">{p.lead}</p>}
            <dl className="doctor-facts">
              {years !== null && (
                <div>
                  <dt>Стаж</dt>
                  <dd>
                    {years} {pluralRu(years, 'год', 'года', 'лет')}
                    <small>в практике с {s.practiceSince} г. — по анкете врача</small>
                  </dd>
                </div>
              )}
              {s.certificates.length > 0 && (
                <div>
                  <dt>Документы</dt>
                  <dd>
                    {s.certificates.length}
                    <small>опубликовано врачом</small>
                  </dd>
                </div>
              )}
              {p?.languages && (
                <div>
                  <dt>Языки консультаций</dt>
                  <dd className="dd-text">{p.languages.join(', ')}</dd>
                </div>
              )}
            </dl>
            <div className="hero-actions">
              <LeadButton place="specialist" />
              {s.certificates.length > 0 && (
                <a href="#documents" className="btn btn-ghost">
                  Документы
                </a>
              )}
            </div>
            <p className="fine">
              Заявку распределяет диспетчер по профилю вопроса. {service.priceLabel}, {service.turnaround}{' '}
              {service.turnaroundStart}.
            </p>
          </div>
        </header>

        <div className="doctor-body">
          {p ? (
            <>
              <section aria-labelledby="comp-h" className="doctor-sec">
                <h2 id="comp-h">Основные компетенции</h2>
                <ul className="ticks">
                  {p.competencies.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </section>
              {p.quote && (
                <blockquote className="pull-quote">
                  <p>{p.quote}</p>
                  <cite>{s.name}</cite>
                </blockquote>
              )}
              {sections.map((sec) => (
                <section key={sec.id} aria-labelledby={`${sec.id}-h`} className="doctor-sec">
                  <h2 id={`${sec.id}-h`}>{sec.title}</h2>
                  <ul className="timeline">
                    {sec.items.map((it) => {
                      const m = it.match(/^([^—]{2,22}) — (.+)$/);
                      return (
                        <li key={it}>
                          {m ? (
                            <>
                              <span className="tl-when">{m[1]}</span>
                              <span>{m[2]}</span>
                            </>
                          ) : (
                            <span>{it}</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
              {p.personal && (
                <section aria-labelledby="personal-h" className="doctor-sec doctor-personal">
                  <h2 id="personal-h">{p.personal.title}</h2>
                  {p.personal.paragraphs.map((t) => (
                    <p key={t}>{t}</p>
                  ))}
                </section>
              )}
            </>
          ) : (
            <section className="doctor-sec">
              <h2>О враче</h2>
              {s.bio.split(/\n+/).map((t, i) => (
                <p key={i}>{t}</p>
              ))}
            </section>
          )}
          {years !== null && (
            <p className="fine method">
              Как считаем стаж: полные годы от года начала практики, который врач указал в анкете ({s.practiceSince}{' '}
              г.).
            </p>
          )}
        </div>

        {s.certificates.length > 0 && (
          <section id="documents" aria-labelledby="docs-h" className="doctor-docs">
            <h2 id="docs-h">Сертификаты и документы</h2>
            <p className="muted">Документы, которые врач выбрал для публикации. Нажмите, чтобы рассмотреть.</p>
            <CertGallery items={s.certificates} />
          </section>
        )}

        <section aria-labelledby="rev-h" className="doctor-reviews">
          <div>
            <h2 id="rev-h">Отзывы</h2>
            {s.reviews.count > 0 ? (
              <p className="rating-line">
                <Stars value={Math.round(s.reviews.average)} /> {s.reviews.average.toFixed(1)} ·{' '}
                {s.reviews.count} {pluralRu(s.reviews.count, 'отзыв', 'отзыва', 'отзывов')}
              </p>
            ) : (
              <p className="muted">Пока нет опубликованных отзывов об этом враче.</p>
            )}
            {s.reviews.items.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
          <div>
            <h3>Оставить отзыв о консультации</h3>
            <ReviewForm slug={s.slug} />
          </div>
        </section>
      </article>
    </>
  );
}
