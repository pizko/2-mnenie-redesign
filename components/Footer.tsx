import Link from 'next/link';
import { APP_ORIGIN, CONTACT_EMAIL, asset, requisites } from '@/lib/config';
import { CookieSettingsButton } from './ConsentBanner';

/** Единый футер всех публичных страниц (раньше на внутренних был урезанный вариант без реквизитов). */
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div className="footer-brand">
          <Link href="/" className="brand brand-light">
            <img src={asset('/logo-80.webp')} alt="" width={40} height={40} className="brand-mark" loading="lazy" />
            <span className="brand-name">
              Второе <span>мнение</span>
            </span>
          </Link>
          <p>Дистанционный разбор ветеринарных документов и обследований врачом профильной специализации.</p>
          <p className="footer-warning">
            Сервис носит информационно-консультационный характер и не заменяет очный приём. При угрозе жизни
            питомца — сразу в круглосуточную клинику.
          </p>
        </div>
        <nav aria-label="Разделы сайта">
          <p className="footer-h">Сервис</p>
          <Link href="/#how">Как это работает</Link>
          <Link href="/#price">Стоимость</Link>
          <Link href="/#sample">Пример заключения</Link>
          <Link href="/specialists">Врачи</Link>
          <Link href="/reviews">Отзывы</Link>
          <Link href="/#faq">Вопросы и ответы</Link>
        </nav>
        <nav aria-label="Материалы">
          <p className="footer-h">Материалы</p>
          <Link href="/articles">Статьи</Link>
          <Link href="/dosages">Справочник дозировок</Link>
          <a href={`${APP_ORIGIN}/login`}>Личный кабинет</a>
          <a href={`${APP_ORIGIN}/register/doctor`}>Я врач — присоединиться</a>
        </nav>
        <nav aria-label="Документы">
          <p className="footer-h">Документы</p>
          <Link href="/documents/offer">Публичная оферта</Link>
          <Link href="/documents/privacy">Политика конфиденциальности</Link>
          <Link href="/documents/disclaimer">Важная информация</Link>
          <Link href="/documents/consent">Согласие на обработку данных</Link>
          <CookieSettingsButton />
        </nav>
      </div>
      <div className="wrap footer-legal">
        <p>
          {requisites.name} · ИНН {requisites.inn} · ОГРНИП {requisites.ogrnip} ·{' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>
        <p>© {new Date().getFullYear()} {requisites.short}</p>
      </div>
    </footer>
  );
}
