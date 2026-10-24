'use client';
import { track } from '@/lib/analytics';

/** FAQ на нативных <details>: работает без JS, доступен с клавиатуры; раскрытие анимируется в CSS. */
export function Faq({ items, place }: { items: { q: string; a: string }[]; place: string }) {
  return (
    <div className="faq">
      {items.map((it, i) => (
        <details
          key={i}
          className="faq-item"
          onToggle={(e) => {
            if ((e.currentTarget as HTMLDetailsElement).open) track('faq_open', { place, n: String(i + 1) });
          }}
        >
          <summary>
            <span>{it.q}</span>
            <span className="faq-icon" aria-hidden="true" />
          </summary>
          <div className="faq-body">
            <p>{it.a}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
