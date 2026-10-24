import type { Specialist } from '@/lib/data';
import { pluralRu, yearsOfPractice } from '@/lib/data';
import { Picture } from './Picture';
import { TrackedLink } from './Tracked';

export function SpecialistCard({ s, place, sizes }: { s: Specialist; place: string; sizes: string }) {
  return (
    <TrackedLink href={`/specialists/${s.slug}`} className="doc-card" goal="specialist_open" params={{ place, slug: s.slug }}>
      <span className="doc-photo">
        {s.photo && <Picture media={s.photo} alt={`${s.name}, ветеринарный врач`} sizes={sizes} aspect="4 / 5" />}
      </span>
      <span className="doc-meta">
        <span className="doc-name">{s.name}</span>
        <span className="doc-tags">{s.tags.join(' · ')}</span>
        {s.practiceSince && (
          <span className="doc-since">
            В практике с {s.practiceSince} г. · {yearsOfPractice(s.practiceSince)}{' '}
            {pluralRu(yearsOfPractice(s.practiceSince), 'год', 'года', 'лет')}
          </span>
        )}
      </span>
    </TrackedLink>
  );
}
