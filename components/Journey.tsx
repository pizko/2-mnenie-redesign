'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';

export type JourneyStep = { title: string; text: ReactNode; note?: ReactNode };

/**
 * «Путь материалов»: на десктопе — ограниченный sticky-сценарий (визуал слева меняет состояние
 * по мере прокрутки шагов), на мобильных — обычная вертикальная последовательность.
 * Прокрутка не перехватывается; текст шагов доступен целиком без анимации.
 */
export function Journey({ steps }: { steps: JourneyStep[] }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i));
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="journey">
      <div className="journey-visual" aria-hidden="true" data-step={active}>
        <div className="jv-card">
          {/* Каждому шагу справа — своя сцена; остальные спрятаны */}
          <div className="jv-layer jv-chat" data-for="0">
            <span className="jv-msg bot">Кто ваш питомец: вид, возраст, вес?</span>
            <span className="jv-msg me">Собака, йорк, 6 лет, 2,8 кг</span>
            <span className="jv-msg bot">Что беспокоит и что уже делали?</span>
            <span className="jv-msg bot">Какой вопрос задать врачу?</span>
          </div>
          <div className="jv-layer jv-files" data-for="1">
            {['Выписка.pdf', 'Анализы.pdf', 'Рентген.dcm', 'Видео.mp4'].map((f, i) => (
              <span key={f} className="jv-file" style={{ ['--i' as string]: i }}>
                {f}
              </span>
            ))}
            <small className="jv-hint">до 20 файлов · до 200 МБ каждый</small>
          </div>
          <div className="jv-layer jv-pay" data-for="2">
            <span className="jv-sum">3 500 ₽</span>
            <span className="jv-row">
              <span className="jv-lock" />
              Оплата картой · ЮKassa
            </span>
            <span className="jv-row jv-done">Заявка передана профильному врачу</span>
          </div>
          <div className="jv-layer jv-doctor" data-for="3">
            <span className="jv-anon">
              <b>Карточка пациента</b>
              <span>Собака · 6 лет · 2,8 кг</span>
              <span>Жалобы, анамнез, 4 файла</span>
              <span className="jv-hidden">Контакты владельца скрыты</span>
            </span>
            <span className="jv-row">
              <span className="jv-avatar" />
              <span>
                Профильный врач
                <small>изучает материалы</small>
              </span>
            </span>
          </div>
          <div className="jv-layer jv-result" data-for="4">
            <span className="jv-pdf">PDF</span>
            <b>Заключение.pdf</b>
            <small>подпись врача · в боте и личном кабинете</small>
          </div>
        </div>
        <p className="jv-progress">
          Шаг {active + 1} из {steps.length}
        </p>
      </div>
      <ol className="journey-steps">
        {steps.map((s, i) => (
          <li
            key={i}
            data-i={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            className={i === active ? 'is-active' : undefined}
          >
            <span className="step-n">{String(i + 1).padStart(2, '0')}</span>
            <h3>{s.title}</h3>
            <div className="step-text">{s.text}</div>
            {s.note && <p className="step-note">{s.note}</p>}
          </li>
        ))}
      </ol>
    </div>
  );
}
