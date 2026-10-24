import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { legal } from '@/lib/data';
import { pageMeta } from '@/lib/seo';

const DESCR: Record<string, string> = {
  offer: 'Публичная оферта сервиса «Второе мнение»: предмет договора, порядок оказания услуг, требования к материалам, оплата и реквизиты исполнителя.',
  privacy: 'Как сервис «Второе мнение» обрабатывает и защищает персональные данные, что передаётся врачам и как отозвать согласие.',
  disclaimer: 'Консультационный характер заключений, согласование с лечащим врачом и признаки, при которых нужна срочная очная помощь.',
};

export const dynamicParams = false;
export const generateStaticParams = () => Object.keys(legal).map((doc) => ({ doc }));

export async function generateMetadata({ params }: { params: Promise<{ doc: string }> }) {
  const { doc } = await params;
  const d = legal[doc as keyof typeof legal];
  if (!d) return {};
  return pageMeta({ title: d.title, description: DESCR[doc], path: `/documents/${doc}` });
}

export default async function DocPage({ params }: { params: Promise<{ doc: string }> }) {
  const { doc } = await params;
  const d = legal[doc as keyof typeof legal];
  if (!d) notFound();
  return (
    <article className="wrap narrow legal">
      <Breadcrumbs items={[{ name: d.title, href: `/documents/${doc}` }]} />
      <p className="eyebrow">Юридические документы</p>
      <h1>{d.title}</h1>
      {d.subtitle && <p className="lead">{d.subtitle}</p>}
      {d.edition && <p className="fine">{d.edition}</p>}
      <div className="legal-body" dangerouslySetInnerHTML={{ __html: d.html }} />
      <nav className="legal-nav" aria-label="Другие документы">
        {Object.entries(legal)
          .filter(([k]) => k !== doc)
          .map(([k, v]) => (
            <Link key={k} href={`/documents/${k}`}>
              {v.title}
            </Link>
          ))}
      </nav>
    </article>
  );
}
