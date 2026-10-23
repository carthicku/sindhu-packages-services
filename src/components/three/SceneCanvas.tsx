import { PerformanceMonitor } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { getQuality } from '../../lib/device';
import { useSceneVisible } from './LazyScene';

type Props = {
  children: ReactNode;
  camera: { position: [number, number, number]; fov?: number };
  shadows?: boolean;
  className?: string;
};

/**
 * Compiles every shader and uploads geometry as soon as the scene mounts —
 * usually while it is still off-screen — so the first visible frame does not
 * stall the page. compileAsync uses parallel shader compilation where the
 * browser supports it.
 */
function Warmup() {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    let cancelled = false;
    const frame = requestAnimationFrame(() => {
      gl.compileAsync(scene, camera)
        .catch(() => undefined)
        .then(() => {
          if (!cancelled) gl.render(scene, camera);
        });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [gl, scene, camera]);
  return null;
}

/** Shared canvas setup: transparent background, adaptive resolution, paused when hidden. */
export function SceneCanvas({ children, camera, shadows = true, className = 'absolute inset-0' }: Props) {
  const visible = useSceneVisible();
  const quality = getQuality();
  const maxDpr = Math.min(window.devicePixelRatio || 1, quality === 'high' ? 1.5 : 1.25);
  const [dpr, setDpr] = useState(maxDpr);
  // Frame times are briefly slow right after a scene appears (uploads, first frames),
  // so measurements from that window are ignored.
  const visibleSince = useRef(performance.now());
  useEffect(() => {
    if (visible) visibleSince.current = performance.now();
  }, [visible]);

  const onDecline = () => {
    if (performance.now() - visibleSince.current < 4000) return;
    setDpr((d) => Math.min(d, 1));
  };

  return (
    <div className={className}>
      <Canvas
        frameloop={visible ? 'always' : 'never'}
        shadows={shadows && quality === 'high'}
        dpr={dpr}
        camera={{ position: camera.position, fov: camera.fov ?? 32, near: 0.5, far: 160 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', stencil: false }}
        aria-hidden="true"
      >
        {/*
          Resolution is fixed per device. It drops once, to 1×, only if the scene keeps
          running below 30 fps — and never steps back up, so quality does not visibly
          switch back and forth while the visitor watches.
        */}
        <PerformanceMonitor bounds={() => [30, 1000]} onDecline={onDecline} />
        <Warmup />
        {children}
      </Canvas>
    </div>
  );
}
