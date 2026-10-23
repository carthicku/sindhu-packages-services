import Lenis from 'lenis';
import { prefersReducedMotion } from './device';

let lenis: Lenis | null = null;

/** Height of the fixed header, so section headings are not hidden beneath it. */
const HEADER_OFFSET = 76;

/**
 * Starts Lenis smooth scrolling for wheel and trackpad input. Touch keeps the
 * native feel, and visitors who prefer reduced motion keep native scrolling.
 */
export function startSmoothScroll(): () => void {
  if (prefersReducedMotion() || lenis) return () => {};
  lenis = new Lenis({ lerp: 0.11, smoothWheel: true, wheelMultiplier: 0.95 });
  let frame = requestAnimationFrame(function raf(time) {
    lenis?.raf(time);
    frame = requestAnimationFrame(raf);
  });
  return () => {
    cancelAnimationFrame(frame);
    lenis?.destroy();
    lenis = null;
  };
}

/** Scrolls to an element; `center` places it in the middle of the viewport. */
export function scrollToElement(el: HTMLElement, block: 'start' | 'center' = 'start') {
  const reduce = prefersReducedMotion();
  const centerOffset = block === 'center' ? -(window.innerHeight - el.offsetHeight) / 2 : -HEADER_OFFSET;
  if (lenis) {
    lenis.scrollTo(el, { offset: centerOffset, duration: 1.2 });
    return;
  }
  const top = el.getBoundingClientRect().top + window.scrollY + centerOffset;
  window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
}

export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { duration: 1.2 });
  else window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
}
