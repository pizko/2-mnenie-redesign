// Контраст текстовых пар палитры (WCAG 2.x). node scripts/check-contrast.mjs
const lum = (hex) => {
  const c = hex.match(/\w\w/g).map((x) => parseInt(x, 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const P = { milk: '#f7f2ea', paper: '#fffcf6', ink: '#123b3e', ink2: '#1d5357', muted: '#4b6466', sky: '#d9e9ef', sky2: '#c5dde6', sageSoft: '#e3eadc', sage: '#8fa88f', sageInk: '#587259', amberSoft: '#fbecd2', amberInk: '#7c4f0e', danger: '#8c2f22', white: '#ffffff', onInk: '#d3e2e3', onInk2: '#e6eeee', footWarn: '#f4dcb3', legal: '#2c4a4d' };
const pairs = [
  ['ink', 'milk', 'основной текст'], ['ink', 'paper', 'текст на бумаге'], ['muted', 'milk', 'вторичный текст'], ['muted', 'paper', 'вторичный на бумаге'],
  ['ink2', 'milk', 'eyebrow/ссылки'], ['ink2', 'paper', 'eyebrow на бумаге'], ['muted', 'sky', 'текст на голубом'], ['ink', 'sky', 'заголовок на голубом'],
  ['ink', 'amberSoft', 'пояснения'], ['amberInk', 'amberSoft', 'бейдж «демо»'], ['amberInk', 'paper', 'звёзды'], ['danger', 'paper', 'срочная помощь'],
  ['muted', 'sageSoft', 'финальный блок'], ['ink', 'sageSoft', 'заголовок финала'], ['white', 'ink', 'кнопка'], ['ink', 'milk', 'светлая кнопка'],
  ['milk', 'ink', 'текст на тёмном'], ['onInk', 'ink', 'вторичный на тёмном'], ['onInk2', 'ink', 'списки на тёмном'], ['sky2', 'ink', 'eyebrow на тёмном'],
  ['footWarn', 'ink', 'предупреждение в футере'], ['legal', 'milk', 'юр. текст'], ['sageInk', 'milk', 'номера и буквы справочника'], ['sageInk', 'paper', 'метка «Заключение»'],
];
let fail = 0;
for (const [fg, bg, use] of pairs) {
  const r = ratio(P[fg], P[bg]);
  const need = use.includes('3:1') ? 3 : 4.5;
  if (r < need) fail++;
  console.log(`${r >= need ? 'ok  ' : 'FAIL'} ${r.toFixed(2).padStart(5)}:1  ${fg} на ${bg} — ${use}`);
}
process.exitCode = fail ? 1 : 0;
