// Скриншоты страниц на нескольких ширинах. BASE=http://127.0.0.1:3477 node scripts/screens.mjs [full]
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://127.0.0.1:3477';
const full = process.argv.includes('full');
const pages = (process.env.PAGES || '/,/specialists,/specialists/pushkin-artem-mihaylovich,/articles,/articles/vtoroe-mnenie-pri-podozrenii-na-rak,/dosages,/reviews,/documents/offer,/nope').split(',');
const widths = (process.env.WIDTHS || '1440,390').split(',').map(Number);
const out = process.env.OUT || 'screenshots';
const b = await chromium.launch();
const report = [];
for (const w of widths) {
  const ctx = await b.newContext({ viewport: { width: w, height: w < 800 ? 844 : 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  await ctx.addInitScript(() => localStorage.setItem('cookie-consent', 'necessary'));
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  p.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  for (const path of pages) {
    const r = await p.goto(BASE + path, { waitUntil: 'networkidle' });
    if (full) {
      // догружаем lazy-картинки (в т.ч. в горизонтальной ленте врачей)
      await p.evaluate(async () => {
        document.querySelectorAll('img[loading="lazy"]').forEach((i) => (i.loading = 'eager'));
        for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
        window.scrollTo(0, 0);
      });
      await p.waitForLoadState('networkidle');
    }
    const overflow = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    const name = (path === '/' ? 'home' : path.slice(1).replace(/\//g, '_')) + `-${w}`;
    await p.screenshot({ path: `${out}/${name}.png`, fullPage: full });
    report.push(`${w} ${path} status=${r.status()} overflowX=${overflow}`);
  }
  if (errors.length) report.push(`${w} errors: ${[...new Set(errors)].join(' | ')}`);
  await ctx.close();
}
await b.close();
console.log(report.join('\n'));
