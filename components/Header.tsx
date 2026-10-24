'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { APP_ORIGIN, asset } from '@/lib/config';
import { BotCta } from './BotCta';

const NAV = [
  { href: '/#how', label: 'Как это работает' },
  { href: '/specialists', label: 'Врачи' },
  { href: '/#price', label: 'Стоимость' },
  { href: '/articles', label: 'Статьи' },
  { href: '/dosages', label: 'Справочник' },
  { href: '/#faq', label: 'Вопросы' },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const btn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    document.documentElement.classList.add('menu-open');
    panel.current?.querySelector<HTMLElement>('a')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        btn.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.documentElement.classList.remove('menu-open');
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Меню — вне <header>: у шапки backdrop-filter, он сделал бы её контейнером для position: fixed
  return (
    <>
    <header className="site-header">
      <a href="#main" className="skip-link">
        К содержанию
      </a>
      <div className="wrap header-row">
        <Link href="/" className="brand" aria-label="Второе мнение — на главную">
          <img src={asset('/logo-80.webp')} alt="" width={40} height={40} className="brand-mark" />
          <span className="brand-name">
            Второе <span>мнение</span>
          </span>
        </Link>
        <nav className="nav-desktop" aria-label="Основное меню">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} aria-current={pathname === n.href ? 'page' : undefined}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <a href={`${APP_ORIGIN}/login`} className="link-quiet hide-sm">
            Кабинет
          </a>
          <BotCta source="header" className="btn btn-primary btn-sm hide-sm">
            Оформить в Telegram
          </BotCta>
          <button
            ref={btn}
            type="button"
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? 'Закрыть меню' : 'Открыть меню'}</span>
            <span className="burger" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
      <div id="mobile-menu" ref={panel} className="mobile-menu" data-open={open} hidden={!open}>
        <nav aria-label="Мобильное меню">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)}>
              {n.label}
            </Link>
          ))}
          <Link href="/#sample" onClick={() => setOpen(false)}>
            Пример заключения
          </Link>
          <Link href="/reviews" onClick={() => setOpen(false)}>
            Отзывы
          </Link>
          <a href={`${APP_ORIGIN}/login`}>Личный кабинет</a>
        </nav>
        <BotCta source="mobile_menu" className="btn btn-primary btn-block">
          Оформить в Telegram
        </BotCta>
        <p className="fine">Заявка, файлы и оплата — в Telegram-боте @randomtox_bot.</p>
      </div>
    </>
  );
}
