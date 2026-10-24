'use client';
import { useEffect, useRef, useState } from 'react';
import type { Certificate } from '@/lib/data';
import { asset } from '@/lib/config';

/** Галерея документов: сетка миниатюр + модальный просмотр (<dialog>, стрелки, Esc, возврат фокуса). */
export function CertGallery({ items }: { items: Certificate[] }) {
  const list = items.filter((c) => c.media);
  const [index, setIndex] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (index !== null && !d.open) d.showModal();
    if (index === null && d.open) d.close();
  }, [index]);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setIndex((i) => (i! + 1) % list.length);
      if (e.key === 'ArrowLeft') setIndex((i) => (i! - 1 + list.length) % list.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, list.length]);

  if (!list.length) return null;
  const cur = index !== null ? list[index] : null;
  const big = (c: Certificate) => asset(`${c.media!.base}-${c.media!.widths.at(-1)}.webp`);

  return (
    <>
      <ul className="cert-grid">
        {list.map((c, i) => (
          <li key={c.id}>
            <button
              type="button"
              className="cert-thumb"
              onClick={(e) => {
                opener.current = e.currentTarget;
                setIndex(i);
              }}
            >
              <img
                src={asset(`${c.media!.base}-${c.media!.widths[0]}.webp`)}
                alt={c.alt}
                width={c.media!.width}
                height={c.media!.height}
                loading="lazy"
                decoding="async"
              />
              <span className="cert-cap">
                <span className="cert-type">{c.docType}</span>
                {c.title}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <dialog
        ref={dialog}
        className="lightbox"
        aria-label="Просмотр документа"
        onClose={() => {
          setIndex(null);
          opener.current?.focus();
        }}
        onClick={(e) => {
          if (e.target === dialog.current) setIndex(null);
        }}
      >
        {cur && (
          <figure key={cur.id} className="lightbox-figure">
            <img src={big(cur)} alt={cur.alt} width={cur.media!.width} height={cur.media!.height} />
            <figcaption>
              <span>
                {cur.docType}: {cur.title}
              </span>
              <span aria-live="polite">
                {index! + 1} / {list.length}
              </span>
            </figcaption>
          </figure>
        )}
        <div className="lightbox-nav">
          <button type="button" className="btn btn-ghost" onClick={() => setIndex((i) => (i! - 1 + list.length) % list.length)}>
            ← Назад
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setIndex((i) => (i! + 1) % list.length)}>
            Вперёд →
          </button>
          <button type="button" className="btn btn-primary" onClick={() => setIndex(null)} autoFocus>
            Закрыть
          </button>
        </div>
      </dialog>
    </>
  );
}
