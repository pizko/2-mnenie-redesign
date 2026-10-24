// OG-изображения 1200×630 для разделов и врачей: HTML → PNG через Playwright, шрифты проекта.
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { chromium } from 'playwright';

const root = new URL('../', import.meta.url);
const pub = (p) => new URL(`public${p}`, root).href;
const specialists = JSON.parse(await readFile(new URL('data/specialists.json', root)));
const media = JSON.parse(await readFile(new URL('data/media.json', root)));
await mkdir(new URL('public/og/', root), { recursive: true });

const css = `
@font-face{font-family:S;src:url(${pub('/fonts/serif4-ru.woff2')})}
@font-face{font-family:G;src:url(${pub('/fonts/golos-ru.woff2')})}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;background:#f7f2ea;color:#123b3e;font-family:G;display:flex;overflow:hidden}
.l{flex:1;padding:64px 64px 56px;display:flex;flex-direction:column}
.brand{display:flex;gap:14px;align-items:center;font:600 30px S}
.brand img{width:56px;height:56px;border-radius:14px}
.k{margin-top:auto;font:600 22px G;letter-spacing:.08em;text-transform:uppercase;color:#1d5357}
h1{font:600 64px/1.08 S;margin-top:14px;letter-spacing:-.01em}
p{font:400 26px/1.35 G;color:#4b6466;margin-top:18px}
.r{width:420px;background:#d9e9ef;position:relative}
.r img{width:100%;height:100%;object-fit:cover;object-position:50% 20%}
.sheet{position:absolute;left:60px;right:60px;top:110px;bottom:110px;background:#fff;border-radius:14px;border-top:8px solid #8fa88f;padding:34px;box-shadow:0 20px 40px -20px rgba(18,59,62,.4)}
.sheet b{display:block;font:600 22px S;margin-bottom:18px}
.sheet i{display:block;height:12px;border-radius:6px;background:#e8e2d6;margin:14px 0}
`;
const sheet = `<div class="sheet"><b>Заключение</b><i style="width:80%"></i><i style="width:65%"></i><i style="width:72%"></i><i style="width:50%"></i><i style="width:60%"></i></div>`;
const page = (k, h, p, right) => `<!doctype html><meta charset=utf-8><style>${css}</style><body>
<div class="l"><div class="brand"><img src="${pub('/logo.jpg')}">Второе мнение</div><div class="k">${k}</div><h1>${h}</h1><p>${p}</p></div>
<div class="r">${right ?? sheet}</div></body>`;

const pages = {
  default: page('2-mnenie.ru', 'Второе мнение ветеринара', 'Врач изучит документы и обследования питомца и подготовит письменное заключение'),
  home: page('Онлайн · 3 500 ₽', 'Второе мнение ветеринара по диагнозу и лечению', 'Выписки, анализы и снимки → письменное заключение врача'),
  specialists: page('Команда', 'Ветеринарные врачи сервиса', 'Терапевты, кардиологи, гастроэнтерологи, дерматологи, УЗИ-диагносты'),
  articles: page('Статьи', 'Разобраться до решения', 'Как читать анализы, что спросить у врача и когда перепроверить диагноз'),
  dosages: page('Для ветеринарных врачей', 'Справочник дозировок', 'Действующие вещества, торговые названия, формы выпуска и дозы'),
};
for (const s of specialists) {
  const ph = media[s.slug]?.photo;
  const img = ph ? `<img src="${pub(`${ph.base}-${ph.widths.at(-1)}.webp`)}">` : sheet;
  const tags = s.specialty.split('·').map((t) => t.trim()).filter((t) => t && t !== 'Другое').join(' · ');
  pages[`specialist-${s.slug}`] = page(tags, s.full_name.trim(), 'Ветеринарный врач сервиса «Второе мнение»', img);
}

const browser = await chromium.launch();
const tab = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const [name, html] of Object.entries(pages)) {
  const tmp = new URL('.og-tmp.html', root);
  await writeFile(tmp, html);
  await tab.goto(tmp.href, { waitUntil: 'load' });
  await tab.evaluate(() => document.fonts.ready);
  await tab.screenshot({ path: new URL(`public/og/${name}.png`, root).pathname });
}
await browser.close();
await rm(new URL('.og-tmp.html', root), { force: true });
console.log('og:', Object.keys(pages).length);
