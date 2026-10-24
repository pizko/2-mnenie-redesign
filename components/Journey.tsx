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
          <div className="jv-files">
            {['Выписка.pdf', 'Анализы.pdf', 'Рентген.dcm', 'Видео.mp4'].map((f, i) => (
              <span key={f} className="jv-file" style={{ ['--i' as string]: i }}>
                {f}
              </span>
            ))}
          </div>
          <div className="jv-check">
            <span>Анамнез</span>
            <span>Материалы</span>
            <span>Вопросы владельца</span>
          </div>
          <div className="jv-pay">
            <span className="jv-lock" />
            Оплата · ЮKassa
          </div>
          <div className="jv-doctor">
            <span className="jv-avatar" />
            <span>
              Профильный врач
              <small>видит обезличенную карточку</small>
            </span>
          </div>
          <div className="jv-result">
            <b>Заключение.pdf</b>
            <small>подпись врача · в боте и кабинете</small>
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
