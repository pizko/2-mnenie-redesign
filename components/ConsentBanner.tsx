'use client';
import Link from 'next/link';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { CONSENT_OPEN_EVENT, openConsent, readConsent, saveConsent, subscribeConsent, type Consent } from '@/lib/consent';

const snapshot = () => readConsent() ?? '';
const serverSnapshot = () => 'ssr';

export function ConsentBanner() {
  const consent = useSyncExternalStore(subscribeConsent, snapshot, serverSnapshot);
  const [forced, setForced] = useState(false);
  useEffect(() => {
    const on = () => setForced(true);
    window.addEventListener(CONSENT_OPEN_EVENT, on);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, on);
  }, []);
  // На сервере ('ssr') баннер рендерится сразу — он быстро виден новым посетителям,
  // а тем, кто уже выбрал, его скрывает класс cc-done до гидрации.
  if (!(forced || consent === '' || consent === 'ssr')) return null;

  const choose = (v: Consent) => {
    const before = readConsent();
    saveConsent(v);
    setForced(false);
    if (before === 'accepted' && v !== 'accepted') window.location.reload();
  };

  return (
    <div data-forced={forced || undefined} role="dialog" aria-modal="false" aria-labelledby="cc-title" aria-describedby="cc-text" className="consent">
      <div className="consent-inner">
        <div>
          <p id="cc-title" className="consent-title">
            Файлы cookie
          </p>
          <p id="cc-text">
            Мы используем файлы cookie, чтобы сайт работал корректно, а также — только с вашего согласия — сервис
            аналитики Яндекс Метрика. Это обработка персональных данных в соответствии с Федеральным законом № 152-ФЗ.
            Подробнее — в <Link href="/documents/privacy">Политике конфиденциальности</Link>. Вы можете принять все
            cookie или оставить только необходимые для работы сайта.
          </p>
        </div>
        <div className="consent-actions">
          <button type="button" className="btn btn-ghost" onClick={() => choose('necessary')}>
            Только необходимые
          </button>
          <button type="button" className="btn btn-primary" onClick={() => choose('accepted')}>
            Согласен
          </button>
        </div>
      </div>
    </div>
  );
}

export function CookieSettingsButton() {
  return (
    <button type="button" className="footer-btn" onClick={openConsent}>
      Настройки cookie
    </button>
  );
}
