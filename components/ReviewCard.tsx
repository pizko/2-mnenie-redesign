import type { Review } from '@/lib/data';
import { formatDate } from '@/lib/data';

export function Stars({ value }: { value: number }) {
  return (
    <span className="stars" role="img" aria-label={`Оценка ${value} из 5`}>
      {'★★★★★'.slice(0, value)}
      <span className="stars-off">{'★★★★★'.slice(value)}</span>
    </span>
  );
}

/** Отзыв публикуется целиком — включая замечания клиента. */
export function ReviewCard({ review, big = false }: { review: Review; big?: boolean }) {
  const paras = review.text.split(/\n\s*\n|\n/).map((p) => p.trim()).filter(Boolean);
  return (
    <figure className={`review ${big ? 'review-big' : ''}`}>
      <Stars value={review.rating} />
      <blockquote>
        {paras.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </blockquote>
      <figcaption>
        <strong>{review.author_name}</strong>
        <time dateTime={review.created_at}>{formatDate(review.created_at)}</time>
      </figcaption>
    </figure>
  );
}
