'use client';
import { useEffect, useRef, useState } from 'react';

/**
 * Фильтр справочника работает по уже отрисованному на сервере списку (data-атрибуты),
 * поэтому данные не дублируются в JS-бандле. ?q= и ?species= в адресе поддерживаются,
 * canonical при этом остаётся /dosages.
 */
export function DosageFilter({ species, total }: { species: [string, string][]; total: number }) {
  const [q, setQ] = useState('');
  const [sp, setSp] = useState<string>('');
  const [count, setCount] = useState(total);
  const first = useRef(true);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setQ(p.get('q') ?? '');
    setSp(species.some(([k]) => k === p.get('species')) ? p.get('species')! : '');
  }, [species]);

  useEffect(() => {
    const needle = q.trim().toLowerCase().replace(/ё/g, 'е');
    let n = 0;
    document.querySelectorAll<HTMLElement>('[data-dose]').forEach((el) => {
      const ok = (!needle || el.dataset.text!.includes(needle)) && (!sp || el.dataset.species!.split(' ').includes(sp));
      el.hidden = !ok;
      if (ok) n++;
    });
    document.querySelectorAll<HTMLElement>('[data-letter-group]').forEach((g) => {
      g.hidden = !g.querySelector('[data-dose]:not([hidden])');
    });
    setCount(n);
    if (first.current) {
      first.current = false;
      return;
    }
    const url = new URL(window.location.href);
    q ? url.searchParams.set('q', q) : url.searchParams.delete('q');
    sp ? url.searchParams.set('species', sp) : url.searchParams.delete('species');
    window.history.replaceState(null, '', url);
  }, [q, sp]);

  return (
    <div className="dose-filter" role="search">
      <label className="field">
        <span>Поиск по веществу, торговому названию или показанию</span>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Например: синулокс, фуросемид" />
      </label>
      <fieldset className="chips">
        <legend className="sr-only">Вид животного</legend>
        <button type="button" aria-pressed={sp === ''} onClick={() => setSp('')}>
          Все виды
        </button>
        {species.map(([k, label]) => (
          <button key={k} type="button" aria-pressed={sp === k} onClick={() => setSp(sp === k ? '' : k)}>
            {label}
          </button>
        ))}
      </fieldset>
      <p className="dose-count" role="status" aria-live="polite">
        Найдено: {count} из {total}
      </p>
    </div>
  );
}
