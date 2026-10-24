'use client';
import Link from 'next/link';
import type { ComponentProps } from 'react';
import { track, type Goal } from '@/lib/analytics';

/** Ссылка с целью Метрики. Для внутренних маршрутов — next/link, для файлов — обычный <a>. */
export function TrackedLink({
  goal,
  params,
  external,
  ...props
}: ComponentProps<typeof Link> & { goal: Goal; params?: Record<string, string>; external?: boolean }) {
  const onClick: ComponentProps<'a'>['onClick'] = (e) => {
    track(goal, params);
    props.onClick?.(e);
  };
  if (external) {
    const { href, prefetch, replace, scroll, shallow, locale, ...rest } = props as any;
    return <a href={String(href)} {...rest} onClick={onClick} />;
  }
  return <Link {...props} onClick={onClick} />;
}
