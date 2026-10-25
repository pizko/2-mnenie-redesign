import type { NextConfig } from 'next';

const preview = process.env.PREVIEW === '1';
const basePath = preview ? process.env.BASE_PATH ?? '' : '';

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_PREVIEW: preview ? '1' : '0',
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_LEAD_ENDPOINT: preview ? '' : process.env.LEAD_ENDPOINT ?? '',
  },
  ...(preview
    ? { output: 'export' as const, basePath, trailingSlash: true }
    : {
        // Только публичные страницы: короткий shared-кеш + SWR. Кабинет и API — в основном приложении,
        // их заголовки (private, no-store) этот проект не трогает.
        async headers() {
          return [
            {
              source: '/((?!_next/|api/|cabinet|login|register|telegram-login).*)',
              headers: [{ key: 'Cache-Control', value: 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400' }],
            },
            { source: '/media/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=604800' }] },
            { source: '/fonts/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
          ];
        },
      }),
};

export default config;
