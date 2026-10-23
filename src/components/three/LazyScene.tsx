import { Component, createContext, Suspense, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { canUseWebGL } from '../../lib/device';

const SceneVisibleContext = createContext(true);
export const useSceneVisible = () => useContext(SceneVisibleContext);

class SceneErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    if (import.meta.env.DEV) console.warn('3D scene failed, showing fallback illustration.', error);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/*
 * Idle mounting queue. Building a scene (code, geometry, shaders) is a long
 * task; doing it mid-scroll causes a visible hitch. After the page has loaded,
 * scenes are mounted one at a time while the browser is idle, so they are
 * ready before the visitor reaches them.
 */
const idleQueue: (() => void)[] = [];
let pumping = false;
let pageReady = false;

function pump() {
  if (pumping || !pageReady || !idleQueue.length) return;
  pumping = true;
  const run = () => {
    idleQueue.shift()?.();
    pumping = false;
    window.setTimeout(pump, 700);
  };
  if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(run, { timeout: 5000 });
  else setTimeout(run, 400);
}

if (typeof window !== 'undefined') {
  const ready = () =>
    window.setTimeout(() => {
      pageReady = true;
      pump();
    }, 1200);
  if (document.readyState === 'complete') ready();
  else window.addEventListener('load', ready, { once: true });
}

function mountWhenIdle(fn: () => void) {
  idleQueue.push(fn);
  pump();
  return () => {
    const i = idleQueue.indexOf(fn);
    if (i >= 0) idleQueue.splice(i, 1);
  };
}

type Props = {
  /** Lazily imported scene element. */
  children: ReactNode;
  /** Static illustration shown before load, without WebGL, or if the scene fails. */
  fallback: ReactNode;
  /** Describes the scene for assistive technology. */
  label: string;
  className?: string;
  /** Mount immediately once this close to the viewport, even if the idle queue has not reached it. */
  preloadMargin?: string;
};

/**
 * Mounts a 3D scene during idle time (or immediately when it approaches the
 * viewport), pauses rendering while it is off-screen, and falls back to a
 * static illustration when WebGL is unavailable or the scene errors.
 */
export function LazyScene({ children, fallback, label, className = '', preloadMargin = '900px' }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [supported] = useState(canUseWebGL);

  useEffect(() => {
    const el = ref.current;
    if (!el || !supported) return;
    const mount = () => setMounted(true);
    const cancelIdle = mountWhenIdle(mount);
    const near = new IntersectionObserver(([entry]) => entry.isIntersecting && mount(), { rootMargin: preloadMargin });
    const onScreen = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: '60px' });
    near.observe(el);
    onScreen.observe(el);
    return () => {
      cancelIdle();
      near.disconnect();
      onScreen.disconnect();
    };
  }, [supported, preloadMargin]);

  return (
    <div ref={ref} role="img" aria-label={label} className={`relative ${className}`}>
      {supported && mounted ? (
        <SceneErrorBoundary fallback={fallback}>
          <Suspense fallback={fallback}>
            <SceneVisibleContext.Provider value={visible}>{children}</SceneVisibleContext.Provider>
          </Suspense>
        </SceneErrorBoundary>
      ) : (
        fallback
      )}
    </div>
  );
}
