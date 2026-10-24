import type { Media } from '@/lib/data';
import { asset } from '@/lib/config';

/** Адаптивное webp-изображение из public/media: srcset по заранее нарезанным ширинам, размеры заданы — CLS нет. */
export function Picture({
  media,
  alt,
  sizes,
  className,
  priority = false,
  aspect,
}: {
  media: Media;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
  /** Обрезка под пропорцию через CSS (object-fit), напр. '3 / 4' */
  aspect?: string;
}) {
  const srcSet = media.widths.map((w) => `${asset(`${media.base}-${w}.webp`)} ${Math.min(w, media.width)}w`).join(', ');
  const fallback = media.widths[Math.min(1, media.widths.length - 1)];
  return (
    <img
      src={asset(`${media.base}-${fallback}.webp`)}
      srcSet={srcSet}
      sizes={sizes}
      width={media.width}
      height={media.height}
      alt={alt}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      style={aspect ? { aspectRatio: aspect } : undefined}
    />
  );
}
