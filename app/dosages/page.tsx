import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { DosageFilter } from '@/components/DosageFilter';
import { dosages, SPECIES, formatDate, getSpecialist } from '@/lib/data';
import { dosagesEditorial as ed } from '@/content/dosages-meta';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'Справочник дозировок ветеринарных препаратов',
  description:
    'Профессиональный справочник для ветеринарных врачей: действующие вещества, торговые названия, формы выпуска и дозы для собак, кошек, хорьков, грызунов, птиц и рептилий.',
  path: '/dosages',
  image: '/og/dosages.png',
});

const norm = (s: string) => s.toLowerCase().replace(/ё/g, 'е');

export default function DosagesPage() {
  const letters = [...new Set(dosages.map((d) => d.letter))];
  const species = Object.entries(SPECIES).filter(([k]) => dosages.some((d) => d.species.includes(k)));
  const reviewer = ed.reviewer?.slug ? getSpecialist(ed.reviewer.slug) : null;
  return (
    <div className="dosages">
      <section className="wrap page-head">
        <Breadcrumbs items={[{ name: 'Справочник дозировок', href: '/dosages' }]} />
        <p className="eyebrow pro-badge">Профессиональный раздел · для ветеринарных врачей</p>
        <h1>Дозировки препаратов</h1>
        <p className="lead">
          Таблица по действующим веществам, торговым названиям, формам выпуска и дозам для мелких животных. Справочник
          для ветеринарных врачей — не заменяет осмотр и не является назначением для владельца.
        </p>
        <dl className="editorial">
          <div>
            <dt>Источник</dt>
            <dd>{ed.source ?? 'не указан'}</dd>
          </div>
          <div>
            <dt>Проверил</dt>
            <dd>{ed.reviewer ? reviewer ? <Link href={`/specialists/${reviewer.slug}`}>{reviewer.name}</Link> : ed.reviewer.name : 'не указано'}</dd>
          </div>
          <div>
            <dt>Редакция</dt>
            <dd>{ed.revisedAt ? formatDate(ed.revisedAt) : 'не указана'}</dd>
          </div>
        </dl>
        <p className="owner-warn">
          Владельцам: не меняйте дозу и не начинайте приём препарата без лечащего врача. Если сомневаетесь в
          назначениях — <Link href="/#how">закажите второе мнение</Link>.
        </p>
      </section>

      <section className="wrap dose-layout">
        <div className="dose-side">
          <DosageFilter species={species} total={dosages.length} />
          <nav aria-label="Алфавитный указатель" className="alpha">
            {letters.map((l) => (
              <a key={l} href={`#letter-${l}`}>
                {l}
              </a>
            ))}
          </nav>
        </div>
        <div className="dose-list">
          {letters.map((l) => (
            <section key={l} id={`letter-${l}`} data-letter-group aria-label={`Буква ${l}`}>
              <h2 className="dose-letter">{l}</h2>
              {dosages
                .filter((d) => d.letter === l)
                .map((d) => (
                  <article
                    key={d.id}
                    id={d.id}
                    className="dose"
                    data-dose
                    data-species={d.species.join(' ')}
                    data-text={norm([d.substance, ...d.names, d.use].join(' '))}
                  >
                    <h3>{d.substance}</h3>
                    {d.names.length > 0 && <p className="dose-names">{d.names.join(', ')}</p>}
                    <p className="dose-sp">{d.species.map((s) => SPECIES[s] ?? s).join(' · ')}</p>
                    <dl>
                      {d.use && (
                        <>
                          <dt>Применение</dt>
                          <dd>{d.use}</dd>
                        </>
                      )}
                      <dt>Дозировка</dt>
                      <dd className="dose-main">{d.dosage}</dd>
                      {d.form && (
                        <>
                          <dt>Форма выпуска</dt>
                          <dd>{d.form}</dd>
                        </>
                      )}
                      {d.notes && (
                        <>
                          <dt>Примечания</dt>
                          <dd>{d.notes}</dd>
                        </>
                      )}
                    </dl>
                  </article>
                ))}
            </section>
          ))}
        </div>
      </section>
    </div>
  );
}
