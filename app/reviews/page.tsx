import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ReviewCard } from '@/components/ReviewCard';
import { BotCta } from '@/components/BotCta';
import { reviews, pluralRu } from '@/lib/data';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'Отзывы владельцев о сервисе',
  description:
    'Отзывы владельцев животных о дистанционном втором мнении ветеринара. Публикуем целиком, вместе с замечаниями, только с согласия автора.',
  path: '/reviews',
});

export default function ReviewsPage() {
  return (
    <>
      <section className="wrap page-head narrow">
        <Breadcrumbs items={[{ name: 'Отзывы', href: '/reviews' }]} />
        <p className="eyebrow">Клиенты</p>
        <h1>Отзывы о сервисе</h1>
        <p className="lead">
          Мы просим оценку через несколько дней после заключения. На сайте публикуются только отзывы, которые владелец
          сам согласился оставить. Перед публикацией текст проходит автомодерацию: ненормативная лексика и
          персональные данные по 152-ФЗ на сайт не попадают, подробности из карточки питомца тоже не публикуются.
        </p>
        <p className="muted">
          Сейчас опубликован {reviews.count} {pluralRu(reviews.count, 'отзыв', 'отзыва', 'отзывов')}.
        </p>
      </section>
      <section className="wrap narrow review-list">
        {reviews.items.map((r) => (
          <ReviewCard key={r.id} review={r} big />
        ))}
      </section>
      <section className="wrap narrow cta-band" data-reveal>
        <p>Получили заключение? Оценку можно оставить на странице врача или по ссылке из бота.</p>
        <BotCta source="reviews">Оформить в Telegram</BotCta>
      </section>
    </>
  );
}
