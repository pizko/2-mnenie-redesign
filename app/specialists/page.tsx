import { Breadcrumbs } from '@/components/Breadcrumbs';
import { SpecialistCard } from '@/components/SpecialistCard';
import { LeadButton } from '@/components/LeadForm';
import { specialists } from '@/lib/data';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'Ветеринарные врачи сервиса «Второе мнение»',
  description:
    'Терапевты, кардиологи, гастроэнтерологи, дерматологи и УЗИ-диагносты: образование, курсы повышения квалификации и сертификаты врачей, которые готовят заключения.',
  path: '/specialists',
  image: '/og/specialists.png',
});

export default function SpecialistsPage() {
  const tags = [...new Set(specialists.flatMap((s) => s.tags))];
  return (
    <>
      <section className="wrap page-head">
        <Breadcrumbs items={[{ name: 'Врачи', href: '/specialists' }]} />
        <p className="eyebrow">Команда</p>
        <h1>Врачи, которые разбирают случаи</h1>
        <p className="lead">
          Практикующие ветеринарные врачи. В карточке — образование, опыт, курсы и документы, которые врач выбрал для
          публикации. Заявку направляет диспетчер — профильному специалисту по вашему вопросу.
        </p>
        <p className="tag-cloud" aria-label="Специализации">
          {tags.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </p>
      </section>
      <section className="wrap">
        <div className="doc-grid">
          {specialists.map((s) => (
            <SpecialistCard key={s.slug} s={s} place="catalog" sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 300px" />
          ))}
        </div>
      </section>
      <section className="wrap cta-band" data-reveal>
        <p>Не знаете, к кому обратиться? Опишите ситуацию в заявке — диспетчер передаст её профильному врачу.</p>
        <LeadButton place="catalog" />
      </section>
    </>
  );
}
