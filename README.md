# 2-mnenie-redesign

Редизайн публичной части [2-mnenie.ru](https://2-mnenie.ru) — «Второе мнение», дистанционный разбор ветеринарных документов.
Концепция «Ясность в сложной ситуации». Next.js 16 (App Router), React 19, без UI-библиотек.

- Отчёт: [docs/REPORT.md](docs/REPORT.md)
- Решения владельца: [docs/OWNER-DECISIONS.md](docs/OWNER-DECISIONS.md)
- Аналитика: [docs/ANALYTICS.md](docs/ANALYTICS.md)
- Скриншоты: [screenshots/](screenshots/)
- **Превью:** https://pizko.github.io/2-mnenie-redesign/ (собирается из ветки `redesign`, noindex, без Метрики и отправок)

## Запуск
Нужны Node.js 20+ и npm или bun.

```bash
bun install            # или npm install
npm run data           # (опц.) обновить снимок из API боевого сайта → data/*.json
npm run media          # (опц.) фото и сертификаты врачей → public/media (webp)
node scripts/build-og.mjs   # (опц.) OG-картинки → public/og (нужен Playwright)
npm run build && npm start  # production-режим: http://localhost:3000
```

Без сети сборка идёт по закоммиченному снимку `data/` и `public/media`.

### Превью (статический экспорт, noindex, без Метрики и отправок)
```bash
PREVIEW=1 BASE_PATH=/2mnenie-preview npm run build   # → out/
```
`out/` раздаётся любым статическим сервером по пути `/2mnenie-preview/`. В превью видна плашка, выключены Метрика, атрибуция и отправка отзывов, а robots.txt запрещает индексацию.

## Проверки
```bash
npx tsc --noEmit
BASE=http://127.0.0.1:3000 node scripts/check-site.mjs         # метаданные, sitemap, ссылки, alt, 404
BASE=http://127.0.0.1:3000 node scripts/check-interactive.mjs  # меню, FAQ, галерея, бот, согласие (внешние запросы подменены)
node scripts/check-contrast.mjs                                 # контраст палитры
BASE=http://127.0.0.1:3000 WIDTHS=360,390,768,1024,1440 node scripts/screens.mjs   # скриншоты + горизонтальный скролл
```

## Устройство
- `app/` — маршруты (те же URL, что на боевом сайте), `sitemap.ts`, `robots.ts`, 404.
- `components/` — шапка, футер, баннер cookie, Метрика, CTA с атрибуцией, галерея, FAQ, сценарий процесса.
- `content/service.ts` — цена, срок, условия (единый источник, ссылки на оферту).
- `content/doctors.ts` — редакционная разметка биографий (без новых фактов) и короткие метаописания.
- `content/dosages-meta.ts` — источник, проверяющий, дата редакции справочника (пока пусто).
- `lib/config.ts` — домен, бот, ID Метрики, режим превью.

## Выкладка в production
Не выполнялась. Проект рассчитан на `next start` за тем же Caddy: публичные пути — сюда, `/api`, `/cabinet`, `/login`, `/register*`, `/telegram-login` — в основное приложение. Решение за владельцем и разработчиком основного приложения.
