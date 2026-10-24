'use client';
import { METRIKA_ID, IS_PREVIEW } from './config';
import { readConsent } from './consent';

declare global {
  interface Window {
    ym?: (id: number, action: string, ...args: unknown[]) => void;
  }
}

/**
 * Цели Метрики. Передаём только место на странице и публичные идентификаторы (slug врача/статьи).
 * Никаких жалоб, документов, контактов и текстов форм.
 *  - site_to_bot      — переход в Telegram-бота (как на боевом сайте; это НЕ оплата и НЕ заявка)
 *  - cta_click        — нажатие основного CTA, params.place
 *  - sample_open      — открытие примера заключения, params.place
 *  - specialist_open  — переход к карточке врача, params.place, params.slug
 */
export type Goal = 'site_to_bot' | 'cta_click' | 'sample_open' | 'specialist_open' | 'faq_open';

export function track(goal: Goal, params: Record<string, string> = {}) {
  if (IS_PREVIEW) {
    if (process.env.NODE_ENV !== 'production') console.debug('[goal]', goal, params);
    return;
  }
  if (readConsent() !== 'accepted' || typeof window.ym !== 'function') return;
  try {
    window.ym(METRIKA_ID, 'reachGoal', goal, params);
  } catch {}
}

/** Идентификатор клиента Метрики — только при согласии на аналитику (как на боевом сайте). */
export function getYmClientId(): Promise<string | null> {
  if (readConsent() !== 'accepted') return Promise.resolve(null);
  const fromCookie = () => {
    const m = document.cookie.match(/(?:^|; )_ym_uid=([^;]+)/);
    return m?.[1] ? decodeURIComponent(m[1]) : null;
  };
  return new Promise((resolve) => {
    if (typeof window.ym !== 'function') return resolve(fromCookie());
    let done = false;
    const finish = (v: string | null) => {
      if (!done) {
        done = true;
        resolve(v);
      }
    };
    try {
      window.ym(METRIKA_ID, 'getClientID', (id: unknown) =>
        finish(typeof id === 'number' || typeof id === 'string' ? String(id) : fromCookie()),
      );
    } catch {
      finish(fromCookie());
    }
    setTimeout(() => finish(fromCookie()), 800);
  });
}
