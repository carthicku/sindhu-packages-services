import * as THREE from 'three';

export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Smoothstep of x between edges a and b, clamped to 0–1. */
export function ss(a: number, b: number, x: number) {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
}

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
export const easeInCubic = (t: number) => Math.pow(clamp(t), 3);
export const easeInOut = (t: number) => {
  const x = clamp(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};

/** Point between a and b at t, lifted on a parabolic arc of the given height. */
export function arc(a: THREE.Vector3, b: THREE.Vector3, t: number, height: number, out: THREE.Vector3) {
  out.lerpVectors(a, b, t);
  out.y += Math.sin(Math.PI * t) * height;
  return out;
}
