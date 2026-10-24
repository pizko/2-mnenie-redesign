'use client';
import { useState } from 'react';
import { API_URL, IS_PREVIEW } from '@/lib/config';

/** Форма отзыва о враче — тот же контракт, что на боевом сайте: POST /api/specialists/{slug}/reviews. */
export function ReviewForm({ slug }: { slug: string }) {
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (IS_PREVIEW) {
      setState('error');
      setError('В превью отправка отключена — отзыв не будет опубликован.');
      return;
    }
    setState('sending');
    setError('');
    try {
      const r = await fetch(`${API_URL}/specialists/${slug}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author_name: name.trim(), rating, text: text.trim() }),
      });
      if (!r.ok) throw new Error((await r.json().catch(() => null))?.detail || 'Не удалось отправить отзыв');
      setName('');
      setText('');
      setRating(5);
      setState('done');
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : 'Ошибка отправки');
    }
  }

  return (
    <form className="review-form" onSubmit={submit} noValidate={false}>
      <p className="fine">
        Не указывайте телефон, почту, ФИО и другие персональные данные — такие отзывы не публикуются.
      </p>
      <label className="field">
        <span>Ваше имя</span>
        <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={60} autoComplete="given-name" />
      </label>
      <fieldset className="field rating-field">
        <legend>Оценка</legend>
        <div className="rating-input">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n}>
              <input type="radio" name="rating" value={n} checked={rating === n} onChange={() => setRating(n)} />
              <span aria-hidden="true">★</span>
              <span className="sr-only">{n} из 5</span>
            </label>
          ))}
        </div>
      </fieldset>
      <label className="field">
        <span>Комментарий</span>
        <textarea value={text} onChange={(e) => setText(e.target.value)} required rows={4} maxLength={2000} />
      </label>
      <button type="submit" className="btn btn-primary" disabled={state === 'sending'}>
        {state === 'sending' ? 'Отправка…' : 'Оставить отзыв'}
      </button>
      <p role="status" className={`form-status ${state}`}>
        {state === 'done' && 'Спасибо, отзыв опубликован.'}
        {state === 'error' && error}
      </p>
    </form>
  );
}
