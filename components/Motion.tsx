'use client';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Один IntersectionObserver на страницу:
 *  - [data-reveal] получают .is-in при появлении (мягкое появление секций);
 *  - [data-anim] получают data-playing=true/false — фоновые анимации стоят вне экрана.
 * Без JS и при prefers-reduced-motion контент виден сразу (см. globals.css).
 */
export function Motion() {
  const pathname = usePathname();
  useEffect(() => {
    const reveal = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            reveal.unobserve(e.target);
          }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    );
    const play = new IntersectionObserver((entries) => {
      for (const e of entries) (e.target as HTMLElement).dataset.playing = String(e.isIntersecting);
    });
    document.querySelectorAll('[data-reveal]:not(.is-in)').forEach((el) => reveal.observe(el));
    document.querySelectorAll('[data-anim]').forEach((el) => play.observe(el));
    return () => {
      reveal.disconnect();
      play.disconnect();
    };
  }, [pathname]);
  return null;
}
