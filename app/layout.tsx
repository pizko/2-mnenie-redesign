import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ConsentBanner } from '@/components/ConsentBanner';
import { Metrika } from '@/components/Metrika';
import { Motion } from '@/components/Motion';
import { IS_PREVIEW, SITE_URL, asset } from '@/lib/config';
import { fontCss, fontPreload } from './fonts';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Второе мнение ветеринара онлайн', template: '%s | Второе мнение' },
  applicationName: 'Второе мнение',
  icons: {
    icon: [
      { url: asset('/favicon.ico'), sizes: '48x48' },
      { url: asset('/favicon-32.png'), sizes: '32x32', type: 'image/png' },
      { url: asset('/brand-icon.png'), sizes: '512x512', type: 'image/png' },
    ],
    apple: { url: asset('/apple-touch-icon.png'), sizes: '180x180' },
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { themeColor: '#f7f2ea', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        {fontPreload.map((href) => (
          <link key={href} rel="preload" href={href} as="font" type="font/woff2" crossOrigin="" />
        ))}
        <style dangerouslySetInnerHTML={{ __html: fontCss }} />
        {/* Анимации появления — только при работающем JS (без него контент виден сразу).
            cc-done: согласие уже дано — баннер, отрисованный на сервере, не показываем. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.documentElement.classList.add('js');try{if(localStorage.getItem('cookie-consent'))document.documentElement.classList.add('cc-done')}catch(e){}",
          }} />
      </head>
      <body>
        {IS_PREVIEW && (
          <div className="preview-bar" role="note">
            Превью редизайна · не индексируется · заявки и отзывы отсюда не отправляются
          </div>
        )}
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <ConsentBanner />
        <Metrika />
        <Motion />
      </body>
    </html>
  );
}
