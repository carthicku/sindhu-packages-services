import { useFrame } from '@react-three/fiber';
import { forwardRef, useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import * as THREE from 'three';
import { LOGO_URL } from '../../../config/brand';

export const WHEEL_RADIUS = 0.36;
/** Distance from the truck's origin to its rear doors (the truck faces +x). */
export const TRUCK_REAR = 2.12;

/** Fleet livery: sky-blue container, orange cab, white roof fairing. */
const LIVERY = {
  container: '#2E9BD6',
  containerDark: '#1F7DB5',
  cab: '#F07A1E',
  fairing: '#F4F5F7',
  hazard: '#F5C518',
  chrome: '#C9CED6',
  black: '#1E232B',
};


let logoRequest: Promise<HTMLImageElement> | null = null;

function loadLogo() {
  logoRequest ??= new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = LOGO_URL;
  });
  return logoRequest;
}

/**
 * Draws the logo fitted inside a box centred on (cx, cy). A non-zero `edge`
 * adds a white decal border so the maroon lettering stays legible on blue.
 */
function drawLogo(ctx: CanvasRenderingContext2D, logo: HTMLImageElement, cx: number, cy: number, maxW: number, maxH: number, edge = 0) {
  const aspect = logo.naturalWidth / logo.naturalHeight;
  let w = maxW;
  let h = w / aspect;
  if (h > maxH) {
    h = maxH;
    w = h * aspect;
  }
  const x = cx - w / 2;
  const y = cy - h / 2;
  if (edge > 0) {
    const silhouette = document.createElement('canvas');
    silhouette.width = Math.ceil(w);
    silhouette.height = Math.ceil(h);
    const sc = silhouette.getContext('2d');
    if (sc) {
      sc.drawImage(logo, 0, 0, w, h);
      sc.globalCompositeOperation = 'source-in';
      sc.fillStyle = '#FFFFFF';
      sc.fillRect(0, 0, w, h);
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) ctx.drawImage(silhouette, x + Math.cos(a) * edge, y + Math.sin(a) * edge);
    }
  }
  ctx.drawImage(logo, x, y, w, h);
}

/** Container side: corrugated blue panel carrying the logo. */
function drawContainerSide(canvas: HTMLCanvasElement, logo?: HTMLImageElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const { width: w, height: h } = canvas;
  ctx.fillStyle = LIVERY.container;
  ctx.fillRect(0, 0, w, h);
  // Corrugation: light and shadow strips give the ribbed container look.
  for (let x = 0; x < w; x += 26) {
    ctx.fillStyle = 'rgba(255,255,255,0.10)';
    ctx.fillRect(x, 0, 9, h);
    ctx.fillStyle = 'rgba(0,0,0,0.13)';
    ctx.fillRect(x + 9, 0, 3, h);
  }
  ctx.fillStyle = 'rgba(0,0,0,0.16)';
  ctx.fillRect(0, 0, w, 16);
  ctx.fillRect(0, h - 16, w, 16);
  if (logo) drawLogo(ctx, logo, w * 0.5, h * 0.5, w * 0.84, h * 0.72, 5);
}

/** Roof fairing front: white panel carrying the logo. */
function drawFairing(canvas: HTMLCanvasElement, logo?: HTMLImageElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const { width: w, height: h } = canvas;
  ctx.fillStyle = LIVERY.fairing;
  ctx.fillRect(0, 0, w, h);
  if (logo) drawLogo(ctx, logo, w * 0.5, h * 0.5, w * 0.86, h * 0.82);
}

function drawHazard(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const { width: w, height: h } = canvas;
  ctx.fillStyle = LIVERY.hazard;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#111111';
  for (let x = -h; x < w + h; x += 24) {
    ctx.beginPath();
    ctx.moveTo(x, h);
    ctx.lineTo(x + 12, h);
    ctx.lineTo(x + 12 + h, 0);
    ctx.lineTo(x + h, 0);
    ctx.closePath();
    ctx.fill();
  }
}

type Livery = { side: THREE.CanvasTexture; fairing: THREE.CanvasTexture; hazard: THREE.CanvasTexture };
let shared: Livery | null = null;

function makeTexture(width: number, height: number, draw: (c: HTMLCanvasElement) => void) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  draw(canvas);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

/** One set of livery textures shared by every truck on the page. */
function useLivery() {
  const livery = useMemo(() => {
    if (!shared) {
      shared = {
        side: makeTexture(1024, 640, drawContainerSide),
        fairing: makeTexture(560, 200, drawFairing),
        hazard: makeTexture(128, 16, drawHazard),
      };
    }
    return shared;
  }, []);

  useEffect(() => {
    // Paint the logo onto the shared textures once the image has loaded.
    let cancelled = false;
    loadLogo()
      .then((logo) => {
        if (cancelled) return;
        drawContainerSide(livery.side.image as HTMLCanvasElement, logo);
        drawFairing(livery.fairing.image as HTMLCanvasElement, logo);
        livery.side.needsUpdate = true;
        livery.fairing.needsUpdate = true;
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [livery]);

  return livery;
}

function Wheel({ position, width = 0.3 }: { position: [number, number, number]; width?: number }) {
  const outer = position[2] > 0 ? 1 : -1;
  return (
    <group position={position} name="wheel">
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[WHEEL_RADIUS, WHEEL_RADIUS, width, 28]} />
        <meshStandardMaterial color="#1D232C" roughness={0.9} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.21, 0.21, width + 0.02, 20]} />
        <meshStandardMaterial color={LIVERY.chrome} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Hub and spoke bar so rotation reads clearly. */}
      <mesh position={[0, 0, outer * (width / 2 + 0.015)]}>
        <boxGeometry args={[0.34, 0.06, 0.01]} />
        <meshStandardMaterial color="#6C7682" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0, outer * (width / 2 + 0.02)]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.02, 12]} />
        <meshStandardMaterial color="#8C949E" metalness={0.6} roughness={0.35} />
      </mesh>
    </group>
  );
}

type TruckProps = JSX.IntrinsicElements['group'] & {
  /** Distance travelled; wheels rotate to match it. */
  travel?: MutableRefObject<number>;
  /** 0 = rear doors closed, 1 = open. */
  door?: MutableRefObject<number>;
};

// Container spans x −2.12 → 0.88; cab spans 0.95 → 2.15.
const BOX_X = -0.62;
const BOX_LEN = 3.0;
const BOX_Y = 1.62;
const BOX_H = 1.86;
const BOX_W = 1.74;

export const Truck = forwardRef<THREE.Group, TruckProps>(function Truck({ travel, door, ...props }, ref) {
  const livery = useLivery();
  const wheels = useRef<THREE.Group>(null);
  const leftDoor = useRef<THREE.Group>(null);
  const rightDoor = useRef<THREE.Group>(null);

  useFrame(() => {
    if (travel && wheels.current) {
      const angle = -travel.current / WHEEL_RADIUS;
      wheels.current.children.forEach((w) => (w.rotation.z = angle));
    }
    if (door && leftDoor.current && rightDoor.current) {
      const a = door.current * 1.75;
      leftDoor.current.rotation.y = a;
      rightDoor.current.rotation.y = -a;
    }
  });

  const containerMat = (
    <meshStandardMaterial color={LIVERY.container} roughness={0.5} metalness={0.15} />
  );

  return (
    <group ref={ref} {...props}>
      {/* Chassis rails and container underframe */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[4.3, 0.18, 1.1]} />
        <meshStandardMaterial color="#20262F" roughness={0.8} />
      </mesh>
      <mesh position={[BOX_X, BOX_Y - BOX_H / 2 - 0.04, 0]}>
        <boxGeometry args={[BOX_LEN, 0.1, BOX_W]} />
        <meshStandardMaterial color="#2A313B" roughness={0.7} />
      </mesh>

      {/* Container */}
      <mesh position={[BOX_X, BOX_Y, 0]} castShadow receiveShadow>
        <boxGeometry args={[BOX_LEN, BOX_H, BOX_W]} />
        {containerMat}
      </mesh>
      {[1, -1].map((s) => (
        <mesh key={s} position={[BOX_X, BOX_Y, s * (BOX_W / 2 + 0.004)]} rotation={[0, s > 0 ? 0 : Math.PI, 0]}>
          <planeGeometry args={[BOX_LEN - 0.04, BOX_H - 0.04]} />
          <meshStandardMaterial map={livery.side} roughness={0.5} metalness={0.1} />
        </mesh>
      ))}
      {/* Corner posts and top rails */}
      {[BOX_X - BOX_LEN / 2, BOX_X + BOX_LEN / 2].flatMap((x) =>
        [1, -1].map((s) => (
          <mesh key={`${x}${s}`} position={[x, BOX_Y, s * (BOX_W / 2)]}>
            <boxGeometry args={[0.07, BOX_H + 0.02, 0.07]} />
            <meshStandardMaterial color={LIVERY.containerDark} roughness={0.5} metalness={0.2} />
          </mesh>
        )),
      )}
      {[1, -1].map((s) => (
        <mesh key={s} position={[BOX_X, BOX_Y + BOX_H / 2, s * (BOX_W / 2)]}>
          <boxGeometry args={[BOX_LEN, 0.07, 0.07]} />
          <meshStandardMaterial color={LIVERY.containerDark} roughness={0.5} metalness={0.2} />
        </mesh>
      ))}
      {/* Hazard stripes on the top corners */}
      {[BOX_X - BOX_LEN / 2 + 0.3, BOX_X + BOX_LEN / 2 - 0.3].flatMap((x) =>
        [1, -1].map((s) => (
          <mesh key={`h${x}${s}`} position={[x, BOX_Y + BOX_H / 2, s * (BOX_W / 2 + 0.037)]} rotation={[0, s > 0 ? 0 : Math.PI, 0]}>
            <planeGeometry args={[0.42, 0.06]} />
            <meshStandardMaterial map={livery.hazard} roughness={0.6} />
          </mesh>
        )),
      )}

      {/* Rear doors, hinged at the outer edges, with locking bars */}
      <group ref={leftDoor} position={[-TRUCK_REAR + 0.005, BOX_Y, BOX_W / 2]}>
        <mesh position={[-0.02, 0, -BOX_W / 4]} castShadow>
          <boxGeometry args={[0.04, BOX_H - 0.04, BOX_W / 2 - 0.01]} />
          {containerMat}
        </mesh>
        {[-0.22, -0.62].map((z) => (
          <mesh key={z} position={[-0.05, 0, z]}>
            <boxGeometry args={[0.025, BOX_H - 0.2, 0.03]} />
            <meshStandardMaterial color={LIVERY.chrome} metalness={0.6} roughness={0.35} />
          </mesh>
        ))}
      </group>
      <group ref={rightDoor} position={[-TRUCK_REAR + 0.005, BOX_Y, -BOX_W / 2]}>
        <mesh position={[-0.02, 0, BOX_W / 4]} castShadow>
          <boxGeometry args={[0.04, BOX_H - 0.04, BOX_W / 2 - 0.01]} />
          {containerMat}
        </mesh>
        {[0.22, 0.62].map((z) => (
          <mesh key={z} position={[-0.05, 0, z]}>
            <boxGeometry args={[0.025, BOX_H - 0.2, 0.03]} />
            <meshStandardMaterial color={LIVERY.chrome} metalness={0.6} roughness={0.35} />
          </mesh>
        ))}
      </group>
      {/* Dark interior visible when the doors open */}
      <mesh position={[-TRUCK_REAR + 0.04, BOX_Y, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[BOX_W - 0.12, BOX_H - 0.1]} />
        <meshStandardMaterial color="#3A3F48" roughness={1} />
      </mesh>
      <mesh position={[-TRUCK_REAR - 0.02, 0.6, 0]}>
        <boxGeometry args={[0.1, 0.12, 1.6]} />
        <meshStandardMaterial color={LIVERY.black} roughness={0.7} />
      </mesh>
      {[0.68, -0.68].map((z) => (
        <mesh key={z} position={[-TRUCK_REAR - 0.075, 0.6, z]}>
          <boxGeometry args={[0.02, 0.09, 0.18]} />
          <meshStandardMaterial color="#D9483B" emissive="#B32A1F" emissiveIntensity={0.4} />
        </mesh>
      ))}

      {/* Side guard rails and fuel tank between the axles */}
      {[1, -1].map((s) => (
        <group key={s}>
          {[0.46, 0.66].map((y) => (
            <mesh key={y} position={[0.05, y, s * 0.84]}>
              <boxGeometry args={[1.5, 0.04, 0.03]} />
              <meshStandardMaterial color={LIVERY.black} roughness={0.6} />
            </mesh>
          ))}
        </group>
      ))}
      <mesh position={[0.25, 0.56, 0.6]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.16, 0.16, 0.62, 18]} />
        <meshStandardMaterial color={LIVERY.chrome} metalness={0.75} roughness={0.25} />
      </mesh>

      {/* Cab */}
      <mesh position={[1.55, 1.36, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 1.3, 1.74]} />
        <meshStandardMaterial color={LIVERY.cab} roughness={0.38} metalness={0.15} />
      </mesh>
      {/* Windscreen */}
      <mesh position={[2.155, 1.68, 0]}>
        <boxGeometry args={[0.02, 0.5, 1.5]} />
        <meshStandardMaterial color="#2B3A4A" roughness={0.1} metalness={0.5} />
      </mesh>
      {/* Side windows and yellow accent stripe */}
      {[1, -1].map((s) => (
        <group key={s}>
          <mesh position={[1.74, 1.7, s * 0.872]}>
            <boxGeometry args={[0.6, 0.46, 0.01]} />
            <meshStandardMaterial color="#2B3A4A" roughness={0.1} metalness={0.5} />
          </mesh>
          <mesh position={[1.5, 1.02, s * 0.873]}>
            <boxGeometry args={[1.05, 0.05, 0.01]} />
            <meshStandardMaterial color={LIVERY.hazard} roughness={0.5} />
          </mesh>
          <mesh position={[1.42, 1.32, s * 0.873]}>
            <boxGeometry args={[0.01, 0.62, 0.01]} />
            <meshStandardMaterial color="#B85A14" roughness={0.6} />
          </mesh>
          {/* Mirror */}
          <mesh position={[2.16, 1.72, s * 0.94]}>
            <boxGeometry args={[0.04, 0.04, 0.18]} />
            <meshStandardMaterial color={LIVERY.black} />
          </mesh>
          <mesh position={[2.17, 1.62, s * 1.03]}>
            <boxGeometry args={[0.05, 0.32, 0.1]} />
            <meshStandardMaterial color={LIVERY.black} roughness={0.4} />
          </mesh>
          {/* Steps */}
          <mesh position={[1.75, 0.62, s * 0.86]}>
            <boxGeometry args={[0.36, 0.04, 0.12]} />
            <meshStandardMaterial color="#59616C" metalness={0.5} roughness={0.4} />
          </mesh>
        </group>
      ))}
      {/* Black grille band with orange slats */}
      <mesh position={[2.16, 1.2, 0]}>
        <boxGeometry args={[0.03, 0.4, 1.5]} />
        <meshStandardMaterial color={LIVERY.black} roughness={0.6} />
      </mesh>
      {[1.1, 1.2, 1.3].map((y) => (
        <mesh key={y} position={[2.18, y, 0]}>
          <boxGeometry args={[0.02, 0.045, 1.2]} />
          <meshStandardMaterial color={LIVERY.cab} roughness={0.4} />
        </mesh>
      ))}
      {/* Bumper and headlights */}
      <mesh position={[2.17, 0.79, 0]} castShadow>
        <boxGeometry args={[0.16, 0.26, 1.78]} />
        <meshStandardMaterial color={LIVERY.cab} roughness={0.4} metalness={0.1} />
      </mesh>
      <mesh position={[2.18, 0.6, 0]}>
        <boxGeometry args={[0.14, 0.1, 1.8]} />
        <meshStandardMaterial color={LIVERY.black} roughness={0.7} />
      </mesh>
      {[0.5, 0.68, -0.5, -0.68].map((z) => (
        <mesh key={z} position={[2.255, 0.8, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.055, 0.055, 0.02, 16]} />
          <meshStandardMaterial color="#FFF4DC" emissive="#FFE7B5" emissiveIntensity={0.6} />
        </mesh>
      ))}

      {/* White roof fairing with the logo on its sloped front */}
      <mesh position={[1.38, 2.29, 0]} castShadow>
        <boxGeometry args={[0.9, 0.56, 1.7]} />
        <meshStandardMaterial color={LIVERY.fairing} roughness={0.35} />
      </mesh>
      <group position={[1.9, 2.26, 0]} rotation={[0, 0, 0.42]}>
        <mesh castShadow>
          <boxGeometry args={[0.42, 0.6, 1.7]} />
          <meshStandardMaterial color={LIVERY.fairing} roughness={0.35} />
        </mesh>
        <mesh position={[0.212, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[1.6, 0.58]} />
          <meshStandardMaterial map={livery.fairing} roughness={0.4} />
        </mesh>
      </group>

      <group ref={wheels}>
        <Wheel position={[1.5, WHEEL_RADIUS, 0.76]} />
        <Wheel position={[1.5, WHEEL_RADIUS, -0.76]} />
        <Wheel position={[-0.95, WHEEL_RADIUS, 0.72]} width={0.38} />
        <Wheel position={[-0.95, WHEEL_RADIUS, -0.72]} width={0.38} />
        <Wheel position={[-1.65, WHEEL_RADIUS, 0.72]} width={0.38} />
        <Wheel position={[-1.65, WHEEL_RADIUS, -0.72]} width={0.38} />
      </group>
    </group>
  );
});
