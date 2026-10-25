import Link from 'next/link';
import { BotCta } from '@/components/BotCta';
import { LeadButton } from '@/components/LeadForm';
import { HeroStory } from '@/components/HeroStory';
import { Journey } from '@/components/Journey';
import { Faq } from '@/components/Faq';
import { ReviewCard } from '@/components/ReviewCard';
import { SpecialistCard } from '@/components/SpecialistCard';
import { TrackedLink } from '@/components/Tracked';
import { JsonLd } from '@/components/JsonLd';
import { reviews, specialists, articles } from '@/lib/data';
import { service, sampleOpinion } from '@/content/service';
import { abs, asset, CONTACT_EMAIL } from '@/lib/config';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'Второе мнение ветеринара онлайн — разбор диагноза и лечения питомца',
  absoluteTitle: true,
  description: `Ветеринарный врач профильной специализации изучит выписки, анализы и снимки и подготовит письменное заключение. ${service.priceLabel}, ${service.turnaround} ${service.turnaroundStart}.`,
  path: '/',
  image: '/og/home.png',
});

const situations = [
  {
    title: 'Диагноз вызывает вопросы',
    text: 'Непонятно, на чём он основан, или состояние питомца не совпадает с тем, что написано в выписке.',
  },
  {
    title: 'Назначения непонятны',
    text: 'Много препаратов, неясно, зачем каждый и как долго, или лечение идёт, а заметной динамики нет.',
  },
  {
    title: 'Предстоит плановая операция',
    text: 'Хочется до решения спокойно обсудить показания, полноту обследований и вопросы к хирургу.',
  },
  {
    title: 'Заключения расходятся',
    text: 'Две клиники сказали разное — нужен взгляд со стороны на то, какие данные это подтверждают.',
  },
  {
    title: 'Достаточно ли обследований',
    text: 'Не уверены, всё ли нужное сделано и какие исследования стоит обсудить с лечащим врачом.',
  },
];

const urgent = [
  'резкое ухудшение состояния',
  'отказ от еды и воды более 24 часов',
  'затруднённое дыхание или потеря сознания',
  'рвота или диарея с кровью',
  'судороги, паралич или сильная боль',
];

const faq = [
  {
    q: 'Сколько ждать заключение?',
    a: `Заключение готовится ${service.turnaround} ${service.turnaroundStart}.`,
  },
  {
    q: 'Это заменяет приём в клинике?',
    a: 'Нет. Заключение носит информационно-рекомендательный характер и не заменяет очный осмотр, диагностику или экстренную помощь. Решения о лечении принимаются вместе с лечащим врачом.',
  },
  {
    q: 'Какие материалы нужны и в каком виде?',
    a: `Выписки, анализы, заключения УЗИ, снимки, фото и видео — до ${service.files.max} файлов размером до ${service.files.maxSizeMb} МБ каждый. ${service.materials.dicom}`,
  },
  {
    q: 'Что будет, если файлов не хватает или они не открываются?',
    a: service.materials.reupload,
  },
  {
    q: 'Как и где оплатить?',
    a: `Стоимость — ${service.priceLabel}, оплата ${service.payment}. Заявку можно оставить на сайте или в Telegram-боте ${service.botName}; врач начинает работу после 100% предоплаты.`,
  },
  {
    q: 'Можно ли выбрать врача?',
    a: 'Заявку распределяет диспетчер — профильному специалисту по вашему вопросу. Познакомиться с врачами, их образованием и сертификатами можно в разделе «Врачи».',
  },
  {
    q: 'На каком языке заключение?',
    a: 'Заключения оформляются на русском языке — как в примере. Если ваши документы на другом языке, напишите об этом в боте до оплаты.',
  },
  {
    q: 'Можно ли задать вопросы после заключения?',
    a: 'Услуга считается оказанной после направления письменного заключения. Если появились новые анализы или вопросы, можно оформить новое обращение. Чтобы вопросов осталось меньше, сформулируйте их заранее и приложите все анализы, включая старые.',
  },
  {
    q: 'Кто увидит мои контакты?',
    a: 'Врач видит только обезличенную медицинскую карточку питомца. Контактные данные доступны уполномоченному диспетчеру.',
  },
  {
    q: 'Что делать в экстренной ситуации?',
    a: 'Немедленно обратитесь в ближайшую круглосуточную ветеринарную клинику. Онлайн-сервис не предназначен для экстренной помощи.',
  },
];

export default function Home() {
  const review = reviews.items[0];
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'VeterinaryCare',
          name: 'Второе мнение',
          alternateName: '2 мнение',
          url: abs('/'),
          logo: abs('/logo.jpg'),
          email: CONTACT_EMAIL,
          description: 'Дистанционный разбор ветеринарных документов и обследований врачом профильной специализации.',
          makesOffer: {
            '@type': 'Offer',
            name: 'Второе мнение ветеринарного врача (письменное заключение)',
            price: service.price,
            priceCurrency: 'RUB',
          },
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
        }}
      />

      {/* А. Первый экран */}
      <section className="hero">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <p className="eyebrow hero-in" style={{ ['--d' as string]: 0 }}>
              Дистанционный разбор документов
            </p>
            <h1 className="hero-in" style={{ ['--d' as string]: 1 }}>
              Второе мнение ветеринара по&nbsp;диагнозу и&nbsp;лечению вашего питомца
            </h1>
            <p className="lead hero-in" style={{ ['--d' as string]: 2 }}>
              Врач профильной специализации изучит выписки, анализы и снимки и&nbsp;напишет заключение: что
              подтверждают данные, чего не хватает и какие вопросы обсудить с&nbsp;лечащим врачом.
            </p>
            <dl className="hero-facts hero-in" style={{ ['--d' as string]: 3 }}>
              <div>
                <dt>Стоимость</dt>
                <dd>{service.priceLabel}</dd>
              </div>
              <div>
                <dt>Срок</dt>
                <dd>
                  {service.turnaround}
                  <small>{service.turnaroundStart}</small>
                </dd>
              </div>
              <div>
                <dt>Результат</dt>
                <dd>
                  PDF с подписью врача
                  <small>в боте и личном кабинете</small>
                </dd>
              </div>
            </dl>
            <div className="hero-actions hero-in" style={{ ['--d' as string]: 4 }}>
              <LeadButton place="hero" className="btn btn-primary btn-lg" />
              <TrackedLink href="/#sample" goal="sample_open" params={{ place: 'hero' }} className="btn btn-ghost btn-lg">
                Посмотреть пример заключения
              </TrackedLink>
            </div>
            <p className="channel-note hero-in" style={{ ['--d' as string]: 5 }}>
              <span className="tg-icon" aria-hidden="true" />
              <span>
                Кнопка откроет короткую форму заявки — документы можно приложить сразу. Удобнее в Telegram?{' '}
                <BotCta source="hero_tg" className="">
                  Оформите в боте {service.botName}
                </BotCta>
                .
              </span>
            </p>
          </div>
          <HeroStory />
        </div>
      </section>

      {/* Б. Когда полезно */}
      <section className="section" id="when" aria-labelledby="when-h">
        <div className="wrap split">
          <div className="split-head" data-reveal>
            <p className="eyebrow">Когда это может быть полезно</p>
            <h2 id="when-h">Когда хочется понять ситуацию, а&nbsp;не просто получить ещё один ответ</h2>
            <p className="muted">
              Это примеры частых поводов, а не медицинские показания. Решение о лечении остаётся за вами и врачом,
              который видит питомца очно.
            </p>
          </div>
          <ol className="situations">
            {situations.map((s, i) => (
              <li key={s.title} data-reveal style={{ ['--d' as string]: i }}>
                <span className="sit-n">{String(i + 1).padStart(2, '0')}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
        <div className="wrap">
          <aside className="urgent" data-reveal aria-labelledby="urgent-h">
            <h3 id="urgent-h">Когда нужен не онлайн-разбор, а&nbsp;клиника — прямо сейчас</h3>
            <p>Если вы видите у питомца:</p>
            <ul>
              {urgent.map((u) => (
                <li key={u}>{u}</li>
              ))}
            </ul>
            <p>
              <strong>Езжайте в ближайшую круглосуточную ветклинику.</strong> Сервис не оказывает экстренную помощь.
            </p>
          </aside>
        </div>
      </section>

      {/* В + Е. Что будет в заключении — на реальном демонстрационном PDF */}
      <section className="section section-paper" id="sample" aria-labelledby="sample-h">
        <div className="wrap">
          <div className="section-head" data-reveal>
            <p className="eyebrow">Что вы получите</p>
            <h2 id="sample-h">Заключение, которое можно взять на&nbsp;приём к&nbsp;лечащему врачу</h2>
            <p className="muted">
              Ниже — краткий разбор демонстрационного заключения сервиса. Кличка, врач и клинические данные в нём
              вымышлены; структура — как в настоящих заключениях.
            </p>
          </div>
          <div className="sample">
            <article className="sample-sheet" data-reveal aria-label="Пример заключения, демонстрационный">
              <header>
                <span className="demo-badge">Демонстрационный пример</span>
                <p className="sample-pet">Фиби · собака, йоркширский терьер, 6 лет, 2,8 кг · направление: терапевт</p>
                <p className="sample-q">
                  <b>Вопрос владельца:</b> после лечения кашля по ночам ещё слышен свист — достаточно ли текущего
                  лечения и что не упустить?
                </p>
              </header>
              <ol className="sample-parts">
                <li>
                  <h3>Рассмотренные материалы</h3>
                  <p>Рентгенограммы грудной полости, С-реактивный белок, выписка с назначениями, описание симптомов.</p>
                </li>
                <li>
                  <h3>Выводы врача</h3>
                  <p>
                    Повышенный СРБ говорит об остром воспалении; по снимку — усиление бронхиального рисунка, у
                    которого несколько возможных причин. Есть положительная динамика после лечения.
                  </p>
                </li>
                <li className="sample-limit">
                  <h3>Ограничения данных</h3>
                  <p>
                    Для полной оценки материалов недостаточно: не было общего анализа крови и биохимии, нужен
                    контроль в динамике и очный осмотр.
                  </p>
                </li>
                <li>
                  <h3>Вопросы для обсуждения с лечащим врачом</h3>
                  <p>
                    Контрольные анализы и рентген в двух проекциях, ЭХО сердца, подсчёт частоты дыхания во сне.
                    Текущие назначения самостоятельно не отменять.
                  </p>
                </li>
              </ol>
              <footer>Подпись врача, специализация, стаж и дата — в конце документа.</footer>
            </article>
            <div className="sample-side" data-reveal>
              <ul className="ticks">
                <li>Пишем человеческим языком и объясняем термины</li>
                <li>Отделяем то, что подтверждают данные, от предположений</li>
                <li>Честно указываем, каких данных не хватает</li>
                <li>Не отменяем лечение и не ставим окончательный диагноз заочно</li>
              </ul>
              <TrackedLink
                external
                href={asset(sampleOpinion.href)}
                goal="sample_open"
                params={{ place: 'sample_section' }}
                className="btn btn-primary"
                target="_blank"
                rel="noopener"
              >
                Открыть пример целиком (PDF, {sampleOpinion.pages} стр., {sampleOpinion.sizeKb} КБ)
              </TrackedLink>
            </div>
          </div>
        </div>
      </section>

      {/* Г. Как проходит обращение */}
      <section className="section" id="how" aria-labelledby="how-h">
        <div className="wrap">
          <div className="section-head" data-reveal>
            <p className="eyebrow">Как проходит обращение</p>
            <h2 id="how-h">Путь ваших материалов — от&nbsp;бота до&nbsp;заключения</h2>
          </div>
          <Journey
            steps={[
              {
                title: 'Оставьте заявку',
                text: (
                  <p>
                    В форме на сайте или в Telegram-боте {service.botName}: вид и возраст питомца, что беспокоит, что
                    уже делали и какой у вас вопрос к врачу.
                  </p>
                ),
              },
              {
                title: 'Приложите материалы',
                text: (
                  <p>
                    Выписки, анализы, снимки, фото и видео — до {service.files.max} файлов по {service.files.maxSizeMb}{' '}
                    МБ. Снимки КТ, МРТ и рентгена — в исходном формате DICOM.
                  </p>
                ),
                note: 'Совет: приложите и старые анализы — динамика часто важнее одного результата.',
              },
              {
                title: 'Оплата и передача врачу',
                text: (
                  <p>
                    {service.priceLabel}, оплата {service.payment}, 100% предоплата. Диспетчер передаёт заявку
                    профильному врачу — тот видит обезличенную карточку без ваших контактов.
                  </p>
                ),
              },
              {
                title: 'Врач изучает случай',
                text: <p>Врач проверяет материалы и сопоставляет их с описанием и вашими вопросами.</p>,
                note: service.materials.reupload,
              },
              {
                title: 'Вы получаете заключение',
                text: (
                  <p>
                    Подписанный PDF и, по желанию, голосовое пояснение приходят в бот и личный кабинет —{' '}
                    {service.turnaround} {service.turnaroundStart}.
                  </p>
                ),
              },
            ]}
          />
        </div>
      </section>

      {/* Ж. Стоимость */}
      <section className="section section-teal" id="price" aria-labelledby="price-h">
        <div className="wrap price">
          <div className="price-main" data-reveal>
            <p className="eyebrow">Стоимость</p>
            <h2 id="price-h">Одна цена за&nbsp;полное второе мнение</h2>
            <p className="price-value">{service.priceLabel}</p>
            <p className="price-terms">
              Оплата {service.payment} · 100% предоплата · заключение {service.turnaround} {service.turnaroundStart}
            </p>
            <LeadButton place="pricing" className="btn btn-light btn-lg">
              Оставить заявку
            </LeadButton>
          </div>
          <div className="price-cols" data-reveal>
            <div>
              <h3>Входит в стоимость</h3>
              <ul className="ticks ticks-light">
                {service.included.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Не входит в услугу</h3>
              <ul className="dashes">
                {service.notIncluded.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
            <div className="price-note">
              <h3>Перед оплатой проверьте</h3>
              <p>{service.materials.dicom}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Д. Специалисты */}
      <section className="section" id="specialists" aria-labelledby="spec-h">
        <div className="wrap">
          <div className="section-head row-head" data-reveal>
            <div>
              <p className="eyebrow">Кто разбирает случаи</p>
              <h2 id="spec-h">Практикующие ветеринарные врачи</h2>
              <p className="muted">
                В карточке врача — образование, курсы и документы, которые врач выбрал для публикации. Заявку
                направляет диспетчер — профильному специалисту по вашему вопросу.
              </p>
            </div>
            <Link href="/specialists" className="link-arrow">
              Все врачи
            </Link>
          </div>
          <p className="rail-hint" aria-hidden="true">
            Листайте карточки вбок →
          </p>
          <div className="doc-rail" data-reveal tabIndex={0} role="region" aria-label="Врачи сервиса, прокручиваемый список">
            {specialists.map((s) => (
              <SpecialistCard key={s.slug} s={s} place="home" sizes="(max-width: 640px) 70vw, (max-width: 1024px) 34vw, 240px" />
            ))}
          </div>
        </div>
      </section>

      {/* З. После заключения */}
      <section className="section section-paper" id="after" aria-labelledby="after-h">
        <div className="wrap split">
          <div className="split-head" data-reveal>
            <p className="eyebrow">После заключения</p>
            <h2 id="after-h">Что делать с&nbsp;заключением дальше</h2>
          </div>
          <div className="after" data-reveal>
            <p>
              Заключение — письменный итог по присланным материалам: услуга считается оказанной, когда вы его
              получили. Возьмите его на приём к лечащему врачу — вопросы для обсуждения уже собраны в конце документа.
            </p>
            <p>
              Если позже появятся новые анализы или снимки, можно оформить новое обращение — врач увидит новые данные
              целиком.
            </p>
            <p className="note-amber">
              Чтобы после заключения осталось меньше вопросов: заранее запишите, что именно хотите понять, и приложите
              все анализы — включая сделанные несколько месяцев назад.
            </p>
          </div>
        </div>
      </section>

      {/* И. Отзывы */}
      <section className="section" id="reviews" aria-labelledby="rev-h">
        <div className="wrap split">
          <div className="split-head" data-reveal>
            <p className="eyebrow">Отзывы</p>
            <h2 id="rev-h">Что пишут владельцы</h2>
            <p className="muted">
              Публикуем отзывы целиком, вместе с замечаниями. Пока отзыв {reviews.count}: сервис работает недавно, и
              мы не добавляем рейтинги и истории, которых не было.
            </p>
            <Link href="/reviews" className="link-arrow">
              Все отзывы
            </Link>
          </div>
          {review && (
            <div data-reveal>
              <ReviewCard review={review} big />
            </div>
          )}
        </div>
      </section>

      {/* К. FAQ */}
      <section className="section section-paper" id="faq" aria-labelledby="faq-h">
        <div className="wrap split">
          <div className="split-head" data-reveal>
            <p className="eyebrow">Вопросы и ответы</p>
            <h2 id="faq-h">Важно знать до обращения</h2>
            <p className="muted">
              Не нашли ответ? Напишите на <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            </p>
          </div>
          <Faq items={faq} place="home" />
        </div>
      </section>

      {/* Л. О проекте */}
      <section className="section" id="about" aria-labelledby="about-h">
        <div className="wrap about">
          <p className="eyebrow" data-reveal>
            О проекте
          </p>
          <h2 id="about-h" className="about-quote" data-reveal>
            Мы хотим, чтобы профессиональное второе мнение было доступно владельцу животного — независимо от того, где
            он находится и в какой клинике лечится питомец.
          </h2>
          <div className="about-cols" data-reveal>
            <p>
              Врачи разных специализаций изучают историю болезни, анализы и обследования, оценивают диагноз и
              назначенное лечение. Задача — независимый взгляд со стороны, который поможет вам лучше понять ситуацию и
              обсудить следующие шаги с лечащим врачом.
            </p>
            <p>
              Врач работает с обезличенной карточкой и не видит ваших контактов. После обезличивания разобранные случаи
              могут использоваться в образовательных материалах — так опыт одного случая помогает другим владельцам.
            </p>
            <p>
              Читайте также: <Link href={`/articles/${articles[0]?.slug ?? ''}`}>{articles[0]?.title}</Link> и другие{' '}
              <Link href="/articles">статьи для владельцев</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* М. Финальное действие */}
      <section className="final" aria-labelledby="final-h">
        <div className="wrap final-inner" data-reveal>
          <h2 id="final-h">Соберите документы и оставьте заявку</h2>
          <p>
            {service.priceLabel} · {service.turnaround} {service.turnaroundStart} · заключение в PDF с подписью врача
          </p>
          <div className="hero-actions">
            <LeadButton place="final" className="btn btn-primary btn-lg" />
            <Link href="/specialists" className="btn btn-ghost btn-lg">
              Познакомиться с врачами
            </Link>
          </div>
        </div>
      </section>

      <div className="mobile-cta">
        <LeadButton place="mobile_fab" className="btn btn-primary btn-block" />
      </div>
    </>
  );
}
