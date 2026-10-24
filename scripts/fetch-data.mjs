// Снимок публичных данных боевого сайта: API (врачи, отзывы, статьи, справочник) и юр. документы.
// Запуск: npm run data. Сборка работает и без сети — по последнему снимку в data/.
import { writeFile, mkdir } from 'node:fs/promises';

const ORIGIN = process.env.SOURCE_ORIGIN || 'https://2-mnenie.ru';
const out = new URL('../data/', import.meta.url);
await mkdir(out, { recursive: true });

async function get(path, type = 'json') {
  const r = await fetch(ORIGIN + path, { headers: { 'user-agent': '2-mnenie-redesign data snapshot' } });
  if (!r.ok) throw new Error(`${path}: HTTP ${r.status}`);
  return type === 'json' ? r.json() : r.text();
}

for (const name of ['specialists', 'reviews', 'articles', 'dosages']) {
  const data = await get(`/api/${name}`);
  await writeFile(new URL(`${name}.json`, out), JSON.stringify(data, null, 1));
  console.log(name, Array.isArray(data) ? data.length : 'ok');
}

// Отзывы по врачам (публичный GET того же API, что использует форма отзыва)
const specialists = JSON.parse(JSON.stringify(await get('/api/specialists')));
const byDoctor = {};
for (const sp of specialists) byDoctor[sp.slug] = await get(`/api/specialists/${sp.slug}/reviews`);
await writeFile(new URL('specialist-reviews.json', out), JSON.stringify(byDoctor, null, 1));

// Юридические документы: берём текст как есть, вычищаем классы и служебную разметку.
const clean = (html) =>
  html
    .replace(/<!-- -->/g, '')
    .replace(/\s(class|style|data-[\w-]+)="[^"]*"/g, '')
    .replace(/<(\/?)(div|span)[^>]*>/g, '')
    .trim();
const text = (s) => s.replace(/<[^>]+>/g, '').replace(/<!-- -->/g, '').trim();

const legal = {};
for (const slug of ['offer', 'privacy', 'disclaimer']) {
  const html = await get(`/documents/${slug}`, 'text');
  const article = html.match(/<article[^>]*>([\s\S]*?)<\/article>/)?.[1] ?? '';
  const title = text(article.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? '');
  const metas = [...article.matchAll(/<\/h1>([\s\S]*?)<div class="prose-legal/g)][0]?.[1] ?? '';
  const paras = [...metas.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map((m) => text(m[1]));
  const bodyStart = article.indexOf('<div class="prose-legal');
  const body = bodyStart >= 0 ? clean(article.slice(bodyStart).replace(/^<div[^>]*>/, '')) : '';
  legal[slug] = {
    title,
    subtitle: paras.find((p) => !p.startsWith('Актуальная')) ?? '',
    edition: paras.find((p) => p.startsWith('Актуальная')) ?? '',
    html: body.slice(0, body.lastIndexOf('</section>') + '</section>'.length),
  };
  console.log('legal', slug, title, body.length);
}
await writeFile(new URL('legal.json', out), JSON.stringify(legal, null, 1));
await writeFile(new URL('snapshot.json', out), JSON.stringify({ source: ORIGIN, fetched_at: new Date().toISOString() }, null, 1));
