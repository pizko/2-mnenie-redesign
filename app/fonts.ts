import { asset } from '@/lib/config';

// Два семейства: Source Serif 4 (заголовки) и Golos Text (текст). Один файл на семейство:
// кириллица + базовая латиница, цифры, пунктуация, ₽ и № (scripts/build-fonts.sh) — ~35 КБ каждый.
const face = (family: string, file: string) =>
  `@font-face{font-family:'${family}';font-style:normal;font-weight:400 700;font-display:swap;src:url('${asset(`/fonts/${file}`)}') format('woff2')}`;

export const fontCss = face('Golos', 'golos-ru.woff2') + face('Serif4', 'serif4-ru.woff2');
export const fontPreload = ['golos-ru.woff2', 'serif4-ru.woff2'].map((f) => asset(`/fonts/${f}`));
