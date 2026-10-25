// Интерактив: меню, FAQ, галерея, CTA-атрибуция (боевой API подменён), Метрика по согласию, клавиатура.
// Ничего не отправляется на 2-mnenie.ru и в Telegram: все внешние запросы перехватываются.
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://127.0.0.1:3477';
const OUT = process.env.OUT || 'screenshots';
const b = await chromium.launch();
const log = [];
const ok = (c, m) => log.push(`${c ? 'ok  ' : 'FAIL'} ${m}`);

// 1. Мобильное меню
{
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  await p.addInitScript(() => localStorage.setItem('cookie-consent', 'necessary'));
  await p.goto(BASE + '/');
  await p.click('.menu-toggle');
  ok(await p.isVisible('#mobile-menu'), 'меню открывается');
  ok((await p.getAttribute('.menu-toggle', 'aria-expanded')) === 'true', 'aria-expanded=true');
  ok(await p.evaluate(() => document.activeElement?.closest('#mobile-menu') !== null), 'фокус переходит в меню');
  await p.waitForTimeout(450);
  await p.screenshot({ path: `${OUT}/menu-390.png` });
  await p.keyboard.press('Escape');
  ok(!(await p.isVisible('#mobile-menu')), 'Esc закрывает меню');
  ok(await p.evaluate(() => document.activeElement?.classList.contains('menu-toggle')), 'фокус возвращается на кнопку');
  await p.close();
}
// 2. FAQ с клавиатуры + Tab-порядок начинается со skip-link
{
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.addInitScript(() => localStorage.setItem('cookie-consent', 'necessary'));
  await p.goto(BASE + '/');
  await p.keyboard.press('Tab');
  ok(await p.evaluate(() => document.activeElement?.classList.contains('skip-link')), 'первый Tab — «К содержанию»');
  await p.focus('#faq summary');
  await p.keyboard.press('Enter');
  ok(await p.evaluate(() => document.querySelector('#faq details').open), 'FAQ раскрывается с клавиатуры');
  await p.waitForTimeout(400);
  await p.locator('#faq').screenshot({ path: `${OUT}/faq-1440.png` });
  // sticky-сценарий: шаг меняется при прокрутке
  await p.locator('.journey-steps li').nth(3).scrollIntoViewIfNeeded();
  await p.evaluate(() => document.querySelectorAll('.journey-steps li')[3].scrollIntoView({ block: 'center' }));
  await p.waitForTimeout(900);
  ok((await p.getAttribute('.journey-visual', 'data-step')) === '3', 'sticky-сценарий переключил шаг 4');
  await p.screenshot({ path: `${OUT}/journey-1440.png` });
  await p.close();
}
// 3. Галерея документов
{
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.addInitScript(() => localStorage.setItem('cookie-consent', 'necessary'));
  await p.goto(BASE + '/specialists/pushkin-artem-mihaylovich');
  await p.click('.cert-thumb >> nth=0');
  ok(await p.isVisible('dialog.lightbox[open]'), 'галерея открывается');
  await p.keyboard.press('ArrowRight');
  ok((await p.textContent('.lightbox figcaption')).includes('2 / 36'), 'стрелка → листает');
  await p.waitForTimeout(400);
  await p.screenshot({ path: `${OUT}/lightbox-1440.png` });
  await p.keyboard.press('Escape');
  ok(!(await p.isVisible('dialog.lightbox[open]')), 'Esc закрывает галерею');
  ok(await p.evaluate(() => document.activeElement?.classList.contains('cert-thumb')), 'фокус возвращается на миниатюру');
  await p.close();
}
// 4. CTA → бот с атрибуцией (API подменён), Метрика только после согласия
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const posted = [];
  const goals = [];
  await ctx.route('https://2-mnenie.ru/api/public/attribution/clicks', async (r) => {
    posted.push(JSON.parse(r.request().postData()));
    await r.fulfill({ json: { start_param: 'TEST123' } });
  });
  await ctx.route('https://mc.yandex.ru/**', (r) => r.fulfill({ body: 'window.__ymLoaded=1', contentType: 'text/javascript' }));
  await ctx.route('https://t.me/**', (r) => r.fulfill({ body: 'telegram stub', contentType: 'text/plain' }));
  const p = await ctx.newPage();
  await p.goto(BASE + '/');
  ok(await p.isVisible('.consent'), 'баннер cookie показан при первом визите');
  ok(!(await p.evaluate(() => typeof window.ym === 'function')), 'до согласия Метрики нет');
  await p.click('.consent >> text=Согласен');
  await p.waitForFunction(() => typeof window.ym === 'function');
  ok(true, 'после «Согласен» Метрика инициализирована');
  await p.evaluate(() => {
    const orig = window.ym;
    window.__goals = [];
    window.ym = (...a) => { if (a[1] === 'reachGoal') window.__goals.push([a[2], a[3]]); if (a[1] === 'getClientID') a[2]('777'); };
  });
  await p.evaluate(() => { window.__nav = null; });
  const nav = p.waitForURL(/t\.me/);
  await p.click('.channel-note a');
  await nav;
  ok(p.url() === 'https://t.me/randomtox_bot?start=TEST123', `переход в бота с start-параметром (${p.url()})`);
  ok(posted[0]?.source === 'hero_tg' && posted[0]?.ym_client_id === '777' && posted[0]?.landing_path === '/', `POST атрибуции: ${JSON.stringify(posted[0])}`);
  await ctx.close();
}
// 5. Атрибуция не отвечает → через 1,5 с в бота без параметра
{
  const ctx = await b.newContext();
  await ctx.addInitScript(() => localStorage.setItem('cookie-consent', 'necessary'));
  await ctx.route('https://2-mnenie.ru/api/**', () => {}); // висит
  await ctx.route('https://t.me/**', (r) => r.fulfill({ body: 'stub' }));
  const p = await ctx.newPage();
  await p.goto(BASE + '/');
  const t = Date.now();
  await Promise.all([p.waitForURL(/t\.me/), p.click('.channel-note a')]);
  ok(p.url() === 'https://t.me/randomtox_bot' && Date.now() - t < 3000, `таймаут атрибуции: ${p.url()} за ${Date.now() - t} мс`);
  await ctx.close();
}
// 6. Справочник: фильтр
{
  const p = await b.newPage();
  await p.addInitScript(() => localStorage.setItem('cookie-consent', 'necessary'));
  await p.goto(BASE + '/dosages?species=birds');
  await p.waitForTimeout(300);
  ok((await p.textContent('.dose-count')).includes('4 из 172'), `фильтр по ?species=birds: ${await p.textContent('.dose-count')}`);
  await p.fill('.dose-filter input', 'фуросемид');
  await p.click('.chips button >> nth=0');
  await p.waitForTimeout(200);
  ok((await p.textContent('.dose-count')).match(/Найдено: [1-9]/) !== null, `поиск: ${await p.textContent('.dose-count')}`);
  await p.close();
}
// 7. Форма заявки: открытие, валидация, вложения, согласие, отправка (приёмник подменён)
{
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.addInitScript(() => localStorage.setItem('cookie-consent', 'necessary'));
  const sent = [];
  await ctx.route('**/__lead-test', async (r) => {
    sent.push(r.request().postDataBuffer()?.length ?? 0);
    await r.fulfill({ json: { ok: true } });
  });
  const p = await ctx.newPage();
  await p.goto(BASE + '/');
  await p.click('.hero .btn-primary');
  ok(await p.isVisible('dialog.lead-dialog[open]'), 'кнопка в hero открывает форму');
  ok(await p.evaluate(() => document.activeElement?.closest('dialog.lead-dialog') !== null), 'фокус внутри формы');
  await p.click('dialog.lead-dialog button[type=submit]');
  const errs = await p.$$eval('dialog.lead-dialog .field-err', (els) => els.length);
  ok(errs === 5, `пустая форма: ${errs} ошибок (имя, почта, телефон, описание, согласие)`);
  ok(await p.evaluate(() => document.activeElement?.getAttribute('name') === 'name'), 'фокус на первом ошибочном поле');
  await p.fill('[name=name]', 'Тест');
  await p.fill('[name=email]', 'test@example.com');
  await p.fill('[name=phone]', '+7 900 000-00-00');
  await p.fill('[name=story]', 'Тестовая заявка: кошка 5 лет, проверка формы, ничего не отправлять.');
  await p.setInputFiles('dialog.lead-dialog input[type=file]', { name: 'analiz.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 test') });
  ok((await p.$$eval('.file-list li', (l) => l.length)) === 1, 'вложение добавлено в список');
  await p.check('[name=consent]');
  await p.screenshot({ path: `${OUT}/lead-form-390.png`, fullPage: false });
  await p.click('dialog.lead-dialog button[type=submit]');
  await p.waitForTimeout(500);
  const status = (await p.textContent('dialog.lead-dialog')) ?? '';
  if (process.env.EXPECT_LEAD_ENDPOINT) {
    ok(sent.length === 1 && status.includes('Спасибо'), `заявка ушла на подменённый приёмник (${sent[0]} байт) и показано «Спасибо»`);
  } else {
    ok(sent.length === 0 && /превью|недоступен/.test(status), 'без настроенного приёмника форма ничего не отправляет и сообщает об этом');
  }
  await p.keyboard.press('Escape');
  ok(!(await p.isVisible('dialog.lead-dialog[open]')), 'Esc закрывает форму');
  await ctx.close();
}
await b.close();
console.log(log.join('\n'));
process.exitCode = log.some((l) => l.startsWith('FAIL')) ? 1 : 0;
