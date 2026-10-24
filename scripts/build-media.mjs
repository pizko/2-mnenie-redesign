// Публичные медиа врачей: скачивает фото и сертификаты из API и кладёт адаптивные webp в public/media.
// Публичный путь /media/... не попадает под Disallow: /api/ в robots.txt.
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import sharp from 'sharp';

const ORIGIN = process.env.SOURCE_ORIGIN || 'https://2-mnenie.ru';
const root = new URL('../', import.meta.url);
const specialists = JSON.parse(await readFile(new URL('data/specialists.json', root)));
const cache = new URL('.media-cache/', root);
await mkdir(cache, { recursive: true });

const exists = (u) => access(u).then(() => true, () => false);
async function download(src) {
  const key = src.replace(/[^a-z0-9]+/gi, '_').slice(-120);
  const file = new URL(key, cache);
  if (await exists(file)) return readFile(file);
  const r = await fetch(ORIGIN + src);
  if (!r.ok) throw new Error(`${src}: HTTP ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  await writeFile(file, buf);
  return buf;
}

async function variants(buf, dir, base, widths, quality) {
  await mkdir(dir, { recursive: true });
  const meta = await sharp(buf).rotate().metadata();
  const out = [];
  for (const w of widths.filter((w, i) => w <= meta.width || i === 0)) {
    const name = `${base}-${w}.webp`;
    await sharp(buf).rotate().resize({ width: Math.min(w, meta.width) }).webp({ quality }).toFile(new URL(name, dir).pathname);
    out.push(w);
  }
  return { width: meta.width, height: meta.height, widths: out };
}

const manifest = {};
for (const s of specialists) {
  const dir = new URL(`public/media/specialists/${s.slug}/`, root);
  const entry = { photo: null, certificates: [] };
  if (s.photo) {
    // Обрезаем однотонные поля (бывают у фото-скриншотов с телефона — чёрные полосы сверху и снизу)
    const photo = await sharp(await download(s.photo)).rotate().trim({ background: '#000000', threshold: 40 }).toBuffer();
    const v = await variants(photo, dir, 'photo', [240, 400, 640, 900], 78);
    entry.photo = { base: `/media/specialists/${s.slug}/photo`, ...v };
  }
  for (const c of s.certificates) {
    const v = await variants(await download(c.src), dir, `cert-${c.id.slice(0, 8)}`, [360, 1400], 80);
    entry.certificates.push({ id: c.id, base: `/media/specialists/${s.slug}/cert-${c.id.slice(0, 8)}`, ...v });
  }
  manifest[s.slug] = entry;
  console.log(s.slug, entry.photo?.widths, entry.certificates.length);
}
await writeFile(new URL('data/media.json', root), JSON.stringify(manifest, null, 1));

// Статика бренда и демонстрационное заключение
await mkdir(new URL('public/', root), { recursive: true });
for (const f of ['logo.jpg', 'sample-opinion.pdf', 'favicon.ico', 'favicon-32.png', 'apple-touch-icon.png', 'brand-icon.png']) {
  const r = await fetch(`${ORIGIN}/${f}`);
  if (r.ok) await writeFile(new URL(`public/${f}`, root), Buffer.from(await r.arrayBuffer()));
  else console.warn('skip', f, r.status);
}

// Логотип для шапки: исходный logo.jpg крупный, в шапке он 40×40
await sharp(new URL('public/logo.jpg', root).pathname).resize(80, 80).webp({ quality: 85 }).toFile(new URL('public/logo-80.webp', root).pathname);
