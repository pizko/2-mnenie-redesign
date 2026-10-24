// Режимы сборки:
//  - production (по умолчанию): обычный Next.js-сервер на 2-mnenie.ru, Метрика по согласию, атрибуция переходов в бота;
//  - PREVIEW=1: статический экспорт для просмотра (noindex, без Метрики, без отправки отзывов и атрибуции).
export const IS_PREVIEW = process.env.NEXT_PUBLIC_PREVIEW === '1';
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const SITE_URL = 'https://2-mnenie.ru';
/** Кабинет, вход и регистрация врачей живут в основном приложении — в превью ведём на боевой домен. */
export const APP_ORIGIN = IS_PREVIEW ? SITE_URL : '';
export const API_URL = `${SITE_URL}/api`;

export const BOT_URL = 'https://t.me/randomtox_bot';
export const METRIKA_ID = 111152079;
export const CONTACT_EMAIL = 'info@2-mnenie.ru';

/** Путь к статике с учётом basePath (для <img>, PDF и т.п., которые не проходят через next/link). */
export const asset = (p: string) => `${BASE_PATH}${p}`;
export const abs = (p: string) => `${SITE_URL}${p === '/' ? '' : p}`;

export const requisites = {
  name: 'Индивидуальный предприниматель Яцко Вадим',
  short: 'ИП Яцко Вадим',
  inn: '772833008749',
  ogrnip: '326508100454457',
};
