'use client';
// Совместимо с боевым сайтом: тот же ключ localStorage и события,
// чтобы уже данное посетителем согласие сохранилось после выкладки.
const KEY = 'cookie-consent';
export const CONSENT_EVENT = 'cookie-consent-changed';
export const CONSENT_OPEN_EVENT = 'cookie-consent-open';
export type Consent = 'accepted' | 'necessary';

export function readConsent(): Consent | null {
  if (typeof window === 'undefined') return null;
  const v = window.localStorage.getItem(KEY);
  return v === 'accepted' || v === 'necessary' ? v : null;
}

export function saveConsent(v: Consent) {
  window.localStorage.setItem(KEY, v);
  if (v !== 'accepted') {
    for (const c of document.cookie.split(';')) {
      const name = c.split('=')[0]?.trim();
      if (name?.startsWith('_ym')) document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
  }
  window.dispatchEvent(new Event(CONSENT_EVENT));
}

export const openConsent = () => window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));

export function subscribeConsent(cb: () => void) {
  window.addEventListener(CONSENT_EVENT, cb);
  return () => window.removeEventListener(CONSENT_EVENT, cb);
}
