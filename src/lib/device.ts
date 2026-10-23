let webglSupport: boolean | null = null;

/** Detects WebGL once; the 3D scenes fall back to static illustrations without it. */
export function canUseWebGL(): boolean {
  if (webglSupport !== null) return webglSupport;
  try {
    const canvas = document.createElement('canvas');
    webglSupport = !!(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')));
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export type Quality = 'high' | 'low';

/** Tablets, phones and low-memory devices get lighter scenes (no shadows, lower DPR, less scenery). */
export function getQuality(): Quality {
  if (typeof window === 'undefined') return 'low';
  const small = window.matchMedia('(max-width: 1023px)').matches;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  return small || (memory !== undefined && memory <= 4) ? 'low' : 'high';
}
