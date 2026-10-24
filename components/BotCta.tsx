'use client';
import type { ReactNode } from 'react';
import { API_URL, BOT_URL, IS_PREVIEW } from '@/lib/config';
import { getYmClientId, track } from '@/lib/analytics';

/**
 * Переход в Telegram-бота с атрибуцией — повторяет поведение боевого BotCtaLink:
 * POST /api/public/attribution/clicks → start_param → t.me/randomtox_bot?start=<param>.
 * Если API не ответил за 1,5 с, ведём в бота без параметра — посетитель не ждёт.
 */
async function startParam(source: string, ymClientId: string | null) {
  const r = await fetch(`${API_URL}/public/attribution/clicks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source,
      landing_path: window.location.pathname || '/',
      ym_client_id: ymClientId,
      referrer: document.referrer || '',
    }),
  });
  return r.ok ? ((await r.json()).start_param as string | null) ?? null : null;
}

function withStart(url: string, param: string) {
  const u = new URL(url);
  u.searchParams.set('start', param);
  return u.toString();
}

export function BotCta({
  source,
  className = 'btn btn-primary',
  children,
  ariaLabel,
}: {
  source: string;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
}) {
  return (
    <a
      href={BOT_URL}
      className={className}
      aria-label={ariaLabel}
      rel="noopener"
      onClick={async (e) => {
        track('cta_click', { place: source });
        track('site_to_bot', { source });
        // Открытие в новой вкладке / средней кнопкой — не перехватываем
        if (IS_PREVIEW || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        let param: string | null = null;
        try {
          const ym = await getYmClientId();
          param = await Promise.race([
            startParam(source, ym),
            new Promise<null>((r) => setTimeout(() => r(null), 1500)),
          ]);
        } catch {
          param = null;
        }
        window.location.href = param ? withStart(BOT_URL, param) : BOT_URL;
      }}
    >
      {children}
    </a>
  );
}
