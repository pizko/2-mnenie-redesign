import Link from 'next/link';
import type { Metadata } from 'next';
import { LeadButton } from '@/components/LeadForm';

// Без canonical: у 404 его быть не должно (раньше шаблон ссылался на главную)
export const metadata: Metadata = {
  title: 'Страница не найдена',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <section className="wrap page-head narrow nf">
      <p className="eyebrow">Ошибка 404</p>
      <h1>Такой страницы нет</h1>
      <p className="lead">Возможно, ссылка устарела или в адресе опечатка. Вот куда можно перейти:</p>
      <ul className="nf-links">
        <li>
          <Link href="/">Главная — как устроено второе мнение</Link>
        </li>
        <li>
          <Link href="/specialists">Врачи сервиса</Link>
        </li>
        <li>
          <Link href="/articles">Статьи для владельцев</Link>
        </li>
        <li>
          <Link href="/dosages">Справочник дозировок</Link>
        </li>
      </ul>
<LeadButton place="not_found" />
    </section>
  );
}
