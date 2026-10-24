// Проверка собранного сайта: BASE=http://127.0.0.1:3477 node scripts/check-site.mjs
// Статусы, уникальность title/description, длина description, canonical и og:url, отсутствие canonical у 404,
// внутренние ссылки, alt у картинок, приоритетные изображения, вес HTML, JSON-LD.
const BASE = process.env.BASE || 'http://127.0.0.1:3477';
const SITE = 'https://2-mnenie.ru';
const problems = [];
const get = async (u) => {
  const r = await fetch(u, { redirect: 'manual' });
  return { status: r.status, text: await r.text(), headers: r.headers };
};
const attr = (tag, name) => tag.match(new RegExp(`${name}="([^"]*)"`))?.[1];
const decode = (s = '') => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

const sm = await get(`${BASE}/sitemap.xml`);
const urls = [...sm.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const lastmods = [...sm.text.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].length;
console.log(`sitemap: ${urls.length} URL, lastmod у ${lastmods}`);

const titles = new Map(), descs = new Map(), links = new Set();
const rows = [];
for (const url of urls) {
  const path = url.replace(SITE, '') || '/';
  const { status, text, headers } = await get(BASE + path);
  if (status !== 200) problems.push(`${path}: HTTP ${status}`);
  const title = decode(text.match(/<title>([^<]*)<\/title>/)?.[1]);
  const desc = decode(attr(text.match(/<meta name="description"[^>]*>/)?.[0] ?? '', 'content'));
  const canon = attr(text.match(/<link rel="canonical"[^>]*>/)?.[0] ?? '', 'href');
  const ogUrl = attr(text.match(/<meta property="og:url"[^>]*>/)?.[0] ?? '', 'content');
  const ogImg = attr(text.match(/<meta property="og:image"[^>]*>/)?.[0] ?? '', 'content');
  const h1 = (text.match(/<h1[\s>]/g) || []).length;
  if (titles.has(title)) problems.push(`${path}: title дублирует ${titles.get(title)}`);
  titles.set(title, path);
  if (descs.has(desc)) problems.push(`${path}: description дублирует ${descs.get(desc)}`);
  descs.set(desc, path);
  if (!desc || desc.length > 200) problems.push(`${path}: description ${desc?.length ?? 0} символов`);
  if (canon !== url) problems.push(`${path}: canonical ${canon} ≠ ${url}`);
  if (ogUrl !== url) problems.push(`${path}: og:url ${ogUrl}`);
  if (!ogImg) problems.push(`${path}: нет og:image`);
  if (h1 !== 1) problems.push(`${path}: h1 × ${h1}`);
  const imgs = [...text.matchAll(/<img [^>]*>/g)].map((m) => m[0]);
  for (const i of imgs) if (!/ alt="/.test(i)) problems.push(`${path}: img без alt ${attr(i, 'src')}`);
  const eager = imgs.filter((i) => /fetchPriority="high"|fetchpriority="high"/i.test(i)).length;
  const preloadImgs = (text.match(/<link rel="preload"[^>]*as="image"/g) || []).length;
  const unsized = imgs.filter((i) => !/ width="/.test(i) || !/ height="/.test(i)).length;
  if (unsized) problems.push(`${path}: ${unsized} img без width/height`);
  if (/\/api\//.test(imgs.join(' '))) problems.push(`${path}: изображения из /api/`);
  for (const m of text.matchAll(/href="(\/[^"#?]*)/g)) if (!m[1].startsWith('/_next')) links.add(m[1]);
  const ld = [...text.matchAll(/application\/ld\+json">([^<]*)</g)].map((m) => JSON.parse(m[1])['@type']);
  rows.push({ path, kb: Math.round(text.length / 1024), title: title.length, desc: desc.length, eager, preloadImgs, ld: ld.join(','), cache: headers.get('cache-control') });
}
console.table(rows);

// 404: без canonical и с noindex
const nf = await get(`${BASE}/net-takoj-stranicy`);
if (nf.status !== 404) problems.push(`404 отдаёт ${nf.status}`);
if (/rel="canonical"/.test(nf.text)) problems.push('404: есть canonical');
if (!/noindex/.test(nf.text)) problems.push('404: нет noindex');

// внутренние ссылки
for (const l of links) {
  if (/^\/(login|register|cabinet)/.test(l)) continue; // основное приложение
  const { status } = await get(BASE + l);
  if (![200, 308].includes(status)) problems.push(`ссылка ${l}: HTTP ${status}`);
}
console.log(`внутренних ссылок проверено: ${links.size}`);
const robots = await get(`${BASE}/robots.txt`);
console.log(robots.text.trim());
console.log(problems.length ? `\nПРОБЛЕМЫ (${problems.length}):\n- ${problems.join('\n- ')}` : '\nПроблем не найдено');
process.exitCode = problems.length ? 1 : 0;
