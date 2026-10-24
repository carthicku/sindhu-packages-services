import { LOGO_URL, LOGO_WHITE_URL } from '../../config/brand';
import { site } from '../../config/site';

/** The official company logo (swoosh, wordmark and registered mark). Use `white` on dark backgrounds. */
export function BrandLogo({ className = 'h-11 w-auto', white = false }: { className?: string; white?: boolean }) {
  return (
    <img
      src={white ? LOGO_WHITE_URL : LOGO_URL}
      alt={site.name}
      width={1748}
      height={644}
      className={className}
      decoding="async"
    />
  );
}
