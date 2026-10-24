'use client';
import Script from 'next/script';
import { useSyncExternalStore } from 'react';
import { IS_PREVIEW, METRIKA_ID } from '@/lib/config';
import { readConsent, subscribeConsent } from '@/lib/consent';

/** Счётчик грузится только после «Согласен» — как на боевом сайте. В превью не грузится вовсе. */
export function Metrika() {
  const consent = useSyncExternalStore(subscribeConsent, () => readConsent() ?? '', () => 'ssr');
  if (IS_PREVIEW || consent !== 'accepted') return null;
  return (
    <Script id="yandex-metrika" strategy="afterInteractive">{`
      (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
      m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}
      k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
      })(window,document,'script','https://mc.yandex.ru/metrika/tag.js?id=${METRIKA_ID}','ym');
      ym(${METRIKA_ID},'init',{ssr:true,webvisor:true,clickmap:true,ecommerce:"dataLayer",referrer:document.referrer,url:location.href,accurateTrackBounce:true,trackLinks:true});
    `}</Script>
  );
}
