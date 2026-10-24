import Link from 'next/link';
import { abs } from '@/lib/config';
import { JsonLd } from './JsonLd';

export function Breadcrumbs({ items }: { items: { name: string; href: string }[] }) {
  const all = [{ name: 'Главная', href: '/' }, ...items];
  return (
    <>
      <nav aria-label="Навигационная цепочка" className="crumbs">
        <ol>
          {all.map((it, i) => (
            <li key={it.href}>
              {i < all.length - 1 ? <Link href={it.href}>{it.name}</Link> : <span aria-current="page">{it.name}</span>}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: all.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: abs(it.href) })),
        }}
      />
    </>
  );
}
