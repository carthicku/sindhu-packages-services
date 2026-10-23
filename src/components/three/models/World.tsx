import { useMemo } from 'react';
import { C } from './palette';

type G = JSX.IntrinsicElements['group'];

export function Ground({ size = 160, color = C.ground }: { size?: number; color?: string }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <circleGeometry args={[size / 2, 64]} />
      <meshStandardMaterial color={color} roughness={1} />
    </mesh>
  );
}

/** Road running along the x axis, centred on z. */
export function Road({ from = -40, to = 40, z = 0, width = 2.6 }: { from?: number; to?: number; z?: number; width?: number }) {
  const length = to - from;
  const dashes = useMemo(() => {
    const out: number[] = [];
    for (let x = from + 1; x < to - 1; x += 2.2) out.push(x);
    return out;
  }, [from, to]);

  return (
    <group position={[0, 0, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[(from + to) / 2, 0.005, 0]} receiveShadow>
        <planeGeometry args={[length, width]} />
        <meshStandardMaterial color={C.road} roughness={0.95} />
      </mesh>
      {[width / 2 + 0.12, -width / 2 - 0.12].map((dz) => (
        <mesh key={dz} rotation={[-Math.PI / 2, 0, 0]} position={[(from + to) / 2, 0.012, dz]} receiveShadow>
          <planeGeometry args={[length, 0.24]} />
          <meshStandardMaterial color="#D8D2C6" roughness={1} />
        </mesh>
      ))}
      {dashes.map((x) => (
        <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.011, 0]}>
          <planeGeometry args={[1.0, 0.07]} />
          <meshStandardMaterial color="#E9E4DA" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

export function Tree({ scale = 1, ...props }: G & { scale?: number }) {
  return (
    <group scale={scale} {...props}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.1, 1.0, 8]} />
        <meshStandardMaterial color={C.woodDark} roughness={1} />
      </mesh>
      <mesh position={[0, 1.35, 0]} castShadow>
        <icosahedronGeometry args={[0.62, 1]} />
        <meshStandardMaterial color={C.leaf} roughness={0.95} flatShading />
      </mesh>
      <mesh position={[0.18, 1.82, 0.08]} castShadow>
        <icosahedronGeometry args={[0.4, 1]} />
        <meshStandardMaterial color={C.leafDark} roughness={0.95} flatShading />
      </mesh>
    </group>
  );
}

export function StreetLamp(props: G) {
  return (
    <group {...props}>
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.035, 0.05, 2.4, 8]} />
        <meshStandardMaterial color={C.navy} roughness={0.5} />
      </mesh>
      <mesh position={[0, 2.42, 0]}>
        <boxGeometry args={[0.28, 0.08, 0.18]} />
        <meshStandardMaterial color={C.navy} />
      </mesh>
      <mesh position={[0, 2.37, 0]}>
        <boxGeometry args={[0.2, 0.02, 0.12]} />
        <meshStandardMaterial color="#FFF0D0" emissive="#FFD9A0" emissiveIntensity={0.9} />
      </mesh>
    </group>
  );
}

function Window({ w, h, ...props }: G & { w: number; h: number }) {
  return (
    <group {...props}>
      <mesh>
        <boxGeometry args={[w + 0.1, h + 0.1, 0.06]} />
        <meshStandardMaterial color={C.navy} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.032]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial color={C.windowGlow} emissive="#FFC98A" emissiveIntensity={0.28} roughness={0.2} />
      </mesh>
    </group>
  );
}

/** Contemporary two-volume house exterior, front facing +z. */
export function HouseExterior(props: G) {
  return (
    <group {...props}>
      {/* Plinth and garden */}
      <mesh position={[0, 0.06, 0.4]} receiveShadow>
        <boxGeometry args={[7.4, 0.12, 5.6]} />
        <meshStandardMaterial color={C.lawn} roughness={1} />
      </mesh>
      {/* Ground floor volume */}
      <mesh position={[-0.6, 1.45, -0.4]} castShadow receiveShadow>
        <boxGeometry args={[5.2, 2.7, 3.4]} />
        <meshStandardMaterial color={C.white} roughness={0.75} />
      </mesh>
      {/* Upper volume, cantilevered */}
      <mesh position={[0.5, 3.95, -0.2]} castShadow receiveShadow>
        <boxGeometry args={[4.6, 2.3, 3.6]} />
        <meshStandardMaterial color={C.navy} roughness={0.6} />
      </mesh>
      {/* Roof slab */}
      <mesh position={[0.5, 5.16, -0.2]} castShadow>
        <boxGeometry args={[4.9, 0.14, 3.9]} />
        <meshStandardMaterial color={C.paper} roughness={0.7} />
      </mesh>
      {/* Timber screen */}
      <group position={[-2.6, 1.45, 1.32]}>
        {Array.from({ length: 7 }, (_, i) => (
          <mesh key={i} position={[i * 0.14, 0, 0]} castShadow>
            <boxGeometry args={[0.06, 2.6, 0.06]} />
            <meshStandardMaterial color={C.wood} roughness={0.7} />
          </mesh>
        ))}
      </group>
      {/* Door */}
      <mesh position={[0.35, 1.2, 1.31]}>
        <boxGeometry args={[0.95, 2.1, 0.05]} />
        <meshStandardMaterial color={C.woodDark} roughness={0.6} />
      </mesh>
      <mesh position={[0.68, 1.2, 1.34]}>
        <boxGeometry args={[0.04, 0.3, 0.03]} />
        <meshStandardMaterial color={C.amber} />
      </mesh>
      <Window position={[-1.0, 1.55, 1.31]} w={1.3} h={1.5} />
      <Window position={[1.55, 1.55, 1.31]} w={0.9} h={1.5} />
      <Window position={[0.0, 3.95, 1.61]} w={2.6} h={1.3} />
      <Window position={[2.05, 3.95, 1.61]} w={0.8} h={1.3} />
      {/* Path and steps */}
      <mesh position={[0.35, 0.13, 2.4]} receiveShadow>
        <boxGeometry args={[1.1, 0.04, 2.2]} />
        <meshStandardMaterial color="#D9D3C7" roughness={1} />
      </mesh>
      <mesh position={[0.35, 0.18, 1.55]} receiveShadow castShadow>
        <boxGeometry args={[1.4, 0.12, 0.5]} />
        <meshStandardMaterial color="#E4DFD5" roughness={1} />
      </mesh>
      <Tree position={[-3.1, 0.12, 2.3]} scale={1.15} />
      <Tree position={[3.2, 0.12, -1.6]} scale={1.4} />
      <mesh position={[2.6, 0.35, 1.9]} castShadow>
        <icosahedronGeometry args={[0.38, 1]} />
        <meshStandardMaterial color={C.leaf} roughness={0.95} flatShading />
      </mesh>
    </group>
  );
}

/** Glass-and-navy office building exterior, front facing +z. */
export function OfficeTower(props: G) {
  const floors = 4;
  return (
    <group {...props}>
      <mesh position={[0, 0.06, 0.3]} receiveShadow>
        <boxGeometry args={[6.4, 0.12, 5.2]} />
        <meshStandardMaterial color="#DAD6CD" roughness={1} />
      </mesh>
      <mesh position={[0, floors * 1.2 / 2 + 0.12, -0.4]} castShadow receiveShadow>
        <boxGeometry args={[5, floors * 1.2, 3.4]} />
        <meshStandardMaterial color={C.navy2} roughness={0.5} />
      </mesh>
      {Array.from({ length: floors }, (_, f) =>
        Array.from({ length: 5 }, (_, i) => (
          <mesh key={`${f}-${i}`} position={[-2 + i, 0.72 + f * 1.2, 1.31]}>
            <planeGeometry args={[0.82, 0.86]} />
            <meshStandardMaterial
              color={(f + i) % 3 === 0 ? C.windowGlow : C.glass}
              emissive={(f + i) % 3 === 0 ? '#FFC98A' : '#000000'}
              emissiveIntensity={0.22}
              roughness={0.15}
              metalness={0.3}
            />
          </mesh>
        )),
      )}
      {Array.from({ length: floors + 1 }, (_, f) => (
        <mesh key={f} position={[0, 0.12 + f * 1.2, -0.4]}>
          <boxGeometry args={[5.1, 0.06, 3.5]} />
          <meshStandardMaterial color={C.white} roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, 0.72, 1.33]}>
        <boxGeometry args={[1.2, 1.1, 0.04]} />
        <meshStandardMaterial color={C.amber} roughness={0.5} />
      </mesh>
      <Tree position={[-2.8, 0.12, 1.8]} />
      <Tree position={[2.9, 0.12, 1.8]} scale={0.9} />
    </group>
  );
}

type ShellProps = G & {
  w?: number;
  d?: number;
  h?: number;
  floor?: string;
  wall?: string;
  variant?: 'home' | 'office';
};

/**
 * Architectural cutaway: floor slab, two full walls (back and left) and low
 * cut stubs on the open sides, with dark section caps on every cut edge.
 */
export function CutawayShell({ w = 7, d = 5, h = 2.4, floor = C.woodLight, wall = C.wall, variant = 'home', ...props }: ShellProps) {
  const t = 0.16;
  const cap = '#1A2A47';
  return (
    <group {...props}>
      <mesh position={[0, -0.08, 0]} receiveShadow castShadow>
        <boxGeometry args={[w + 0.3, 0.2, d + 0.3]} />
        <meshStandardMaterial color={C.paper} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.021, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color={floor} roughness={0.75} />
      </mesh>

      {/* Back wall with windows */}
      <mesh position={[0, h / 2, -d / 2 - t / 2]} castShadow receiveShadow>
        <boxGeometry args={[w + t * 2, h, t]} />
        <meshStandardMaterial color={wall} roughness={0.9} />
      </mesh>
      <mesh position={[0, h + 0.015, -d / 2 - t / 2]}>
        <boxGeometry args={[w + t * 2, 0.03, t + 0.01]} />
        <meshStandardMaterial color={cap} />
      </mesh>
      {(variant === 'office' ? [-1.2, 0.6, 2.4] : [0.9]).map((x) => (
        <mesh key={x} position={[x, h * 0.58, -d / 2 + 0.005]}>
          <planeGeometry args={[variant === 'office' ? 1.4 : 1.1, h * 0.46]} />
          <meshStandardMaterial color="#CFE0EE" emissive="#BFD7EC" emissiveIntensity={0.25} roughness={0.2} />
        </mesh>
      ))}

      {/* Left wall */}
      <mesh position={[-w / 2 - t / 2, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[t, h, d]} />
        <meshStandardMaterial color={wall} roughness={0.9} />
      </mesh>
      <mesh position={[-w / 2 - t / 2, h + 0.015, 0]}>
        <boxGeometry args={[t + 0.01, 0.03, d]} />
        <meshStandardMaterial color={cap} />
      </mesh>

      {/* Low cut walls on the open front and right */}
      <mesh position={[0, 0.16, d / 2 + t / 2]} castShadow>
        <boxGeometry args={[w + t * 2, 0.32, t]} />
        <meshStandardMaterial color={wall} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.335, d / 2 + t / 2]}>
        <boxGeometry args={[w + t * 2, 0.03, t + 0.01]} />
        <meshStandardMaterial color={cap} />
      </mesh>
      <mesh position={[w / 2 + t / 2, 0.16, 0]} castShadow>
        <boxGeometry args={[t, 0.32, d]} />
        <meshStandardMaterial color={wall} roughness={0.9} />
      </mesh>
      <mesh position={[w / 2 + t / 2, 0.335, 0]}>
        <boxGeometry args={[t + 0.01, 0.03, d]} />
        <meshStandardMaterial color={cap} />
      </mesh>
      {/* Doorway gap marker in the front stub */}
      <mesh position={[1.8, 0.34, d / 2 + t / 2]}>
        <boxGeometry args={[1.0, 0.04, t + 0.02]} />
        <meshStandardMaterial color={C.amber} />
      </mesh>
    </group>
  );
}

/** Interior partition wall (solid or glass) between two points on the floor. */
export function Partition({ from, to, h = 2.4, glass = false }: { from: [number, number]; to: [number, number]; h?: number; glass?: boolean }) {
  const dx = to[0] - from[0];
  const dz = to[1] - from[1];
  const len = Math.hypot(dx, dz);
  const angle = Math.atan2(-dz, dx);
  return (
    <group position={[(from[0] + to[0]) / 2, 0, (from[1] + to[1]) / 2]} rotation={[0, angle, 0]}>
      <mesh position={[0, h / 2, 0]} castShadow={!glass} receiveShadow>
        <boxGeometry args={[len, h, glass ? 0.04 : 0.12]} />
        {glass ? (
          <meshStandardMaterial color="#CFE3F2" transparent opacity={0.32} roughness={0.1} metalness={0.2} />
        ) : (
          <meshStandardMaterial color={C.wall} roughness={0.9} />
        )}
      </mesh>
      <mesh position={[0, h + 0.015, 0]}>
        <boxGeometry args={[len, 0.03, glass ? 0.05 : 0.13]} />
        <meshStandardMaterial color={glass ? C.greyDark : '#1A2A47'} />
      </mesh>
    </group>
  );
}
