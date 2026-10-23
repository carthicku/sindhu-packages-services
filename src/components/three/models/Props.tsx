import { useFrame } from '@react-three/fiber';
import { useRef, type MutableRefObject } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { C } from './palette';

type G = JSX.IntrinsicElements['group'];

/** Rounded geometry is expensive to build, so each size is built once and shared by every instance. */
const roundedCache = new Map<string, THREE.BufferGeometry>();

function RoundedBox({ args, radius = 0.05, children, ...props }: Omit<JSX.IntrinsicElements['mesh'], 'args'> & { args: [number, number, number]; radius?: number }) {
  const key = `${args.join(',')}|${radius}`;
  let geometry = roundedCache.get(key);
  if (!geometry) {
    geometry = new RoundedBoxGeometry(args[0], args[1], args[2], 2, radius);
    roundedCache.set(key, geometry);
  }
  return (
    <mesh geometry={geometry} {...props}>
      {children}
    </mesh>
  );
}

function Mat({ color, rough = 0.7, metal = 0 }: { color: string; rough?: number; metal?: number }) {
  return <meshStandardMaterial color={color} roughness={rough} metalness={metal} />;
}

/** Packed carton with tape and an optional coloured room/department label. */
export function Carton({ size = [0.48, 0.4, 0.48], label, open = false, ...props }: G & { size?: [number, number, number]; label?: string; open?: boolean }) {
  const [w, h, d] = size;
  return (
    <group {...props}>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={size} />
        <Mat color={C.kraft} rough={0.9} />
      </mesh>
      {!open && (
        <mesh position={[0, h + 0.002, 0]}>
          <boxGeometry args={[w * 0.22, 0.006, d + 0.01]} />
          <Mat color={C.tape} rough={0.5} />
        </mesh>
      )}
      {open && (
        <>
          <mesh position={[0, h + 0.1, d / 2 + 0.04]} rotation={[0.5, 0, 0]}>
            <boxGeometry args={[w, 0.01, 0.22]} />
            <Mat color={C.kraftDark} rough={0.9} />
          </mesh>
          <mesh position={[0, h + 0.1, -d / 2 - 0.04]} rotation={[-0.5, 0, 0]}>
            <boxGeometry args={[w, 0.01, 0.22]} />
            <Mat color={C.kraftDark} rough={0.9} />
          </mesh>
        </>
      )}
      <mesh position={[w * 0.18, h * 0.58, d / 2 + 0.003]}>
        <planeGeometry args={[w * 0.34, h * 0.26]} />
        <meshStandardMaterial color={label ?? C.white} roughness={0.8} />
      </mesh>
    </group>
  );
}

export function WrapRoll(props: G) {
  return (
    <group {...props}>
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.6, 24]} />
        <meshStandardMaterial color={C.wrap} roughness={0.25} transparent opacity={0.92} />
      </mesh>
    </group>
  );
}

export function TapeRoll(props: G) {
  return (
    <group {...props}>
      <mesh position={[0, 0.04, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.08, 0.035, 10, 24]} />
        <Mat color={C.amberSoft} rough={0.4} />
      </mesh>
    </group>
  );
}

export function Sofa({ color = C.fabric, ...props }: G & { color?: string }) {
  return (
    <group {...props}>
      <RoundedBox args={[2.0, 0.42, 0.9]} radius={0.06} position={[0, 0.3, 0]} castShadow receiveShadow>
        <Mat color={color} rough={0.95} />
      </RoundedBox>
      <RoundedBox args={[2.0, 0.55, 0.22]} radius={0.06} position={[0, 0.72, -0.34]} castShadow>
        <Mat color={color} rough={0.95} />
      </RoundedBox>
      {[-1, 1].map((s) => (
        <RoundedBox key={s} args={[0.2, 0.32, 0.9]} radius={0.05} position={[s * 0.92, 0.62, 0]} castShadow>
          <Mat color={color} rough={0.95} />
        </RoundedBox>
      ))}
      <RoundedBox args={[0.42, 0.32, 0.12]} radius={0.05} position={[-0.45, 0.68, -0.18]} rotation={[-0.2, 0, 0.1]}>
        <Mat color={C.amberSoft} rough={0.95} />
      </RoundedBox>
    </group>
  );
}

export function CoffeeTable(props: G) {
  return (
    <group {...props}>
      <mesh position={[0, 0.36, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.0, 0.06, 0.55]} />
        <Mat color={C.woodLight} rough={0.6} />
      </mesh>
      {[[-0.42, -0.2], [0.42, -0.2], [-0.42, 0.2], [0.42, 0.2]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.17, z]}>
          <boxGeometry args={[0.05, 0.34, 0.05]} />
          <Mat color={C.woodDark} />
        </mesh>
      ))}
    </group>
  );
}

export function TvUnit(props: G) {
  return (
    <group {...props}>
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.5, 0.42]} />
        <Mat color={C.woodLight} rough={0.6} />
      </mesh>
      <mesh position={[0, 0.98, -0.05]} castShadow>
        <boxGeometry args={[1.3, 0.76, 0.05]} />
        <Mat color={C.screen} rough={0.25} metal={0.3} />
      </mesh>
    </group>
  );
}

export function Bed(props: G) {
  return (
    <group {...props}>
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.3, 2.0]} />
        <Mat color={C.woodLight} rough={0.7} />
      </mesh>
      <RoundedBox args={[1.52, 0.22, 1.92]} radius={0.06} position={[0, 0.44, 0.02]} castShadow>
        <Mat color={C.linen} rough={0.95} />
      </RoundedBox>
      <RoundedBox args={[1.56, 0.08, 1.2]} radius={0.03} position={[0, 0.56, 0.38]}>
        <Mat color={C.fabric} rough={0.95} />
      </RoundedBox>
      {[-0.38, 0.38].map((x) => (
        <RoundedBox key={x} args={[0.6, 0.14, 0.34]} radius={0.06} position={[x, 0.6, -0.68]}>
          <Mat color={C.white} rough={0.95} />
        </RoundedBox>
      ))}
      <mesh position={[0, 0.62, -1.02]} castShadow>
        <boxGeometry args={[1.66, 0.95, 0.08]} />
        <Mat color={C.wood} rough={0.6} />
      </mesh>
    </group>
  );
}

export function Wardrobe(props: G) {
  return (
    <group {...props}>
      <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 2.0, 0.6]} />
        <Mat color={C.paper} rough={0.6} />
      </mesh>
      <mesh position={[0, 1.0, 0.302]}>
        <boxGeometry args={[0.01, 1.9, 0.005]} />
        <Mat color={C.greyMid} />
      </mesh>
      {[-0.08, 0.08].map((x) => (
        <mesh key={x} position={[x, 1.05, 0.31]}>
          <boxGeometry args={[0.02, 0.24, 0.02]} />
          <Mat color={C.amber} />
        </mesh>
      ))}
    </group>
  );
}

export function KitchenCounter(props: G) {
  return (
    <group {...props}>
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.9, 0.6]} />
        <Mat color={C.white} rough={0.5} />
      </mesh>
      <mesh position={[0, 0.92, 0]}>
        <boxGeometry args={[2.44, 0.05, 0.64]} />
        <Mat color={C.greyDark} rough={0.4} />
      </mesh>
      {[-0.8, -0.2, 0.4].map((x) => (
        <mesh key={x} position={[x, 0.5, 0.302]}>
          <boxGeometry args={[0.5, 0.7, 0.005]} />
          <Mat color={C.paper} rough={0.5} />
        </mesh>
      ))}
      <mesh position={[0.6, 0.98, 0]}>
        <cylinderGeometry args={[0.12, 0.1, 0.12, 16]} />
        <Mat color={C.navy3} rough={0.4} />
      </mesh>
    </group>
  );
}

export function Fridge(props: G) {
  return (
    <group {...props}>
      <RoundedBox args={[0.7, 1.85, 0.66]} radius={0.04} position={[0, 0.925, 0]} castShadow receiveShadow>
        <Mat color="#E3E7EC" rough={0.35} metal={0.2} />
      </RoundedBox>
      <mesh position={[0.25, 1.2, 0.335]}>
        <boxGeometry args={[0.03, 0.4, 0.03]} />
        <Mat color={C.greyDark} metal={0.5} />
      </mesh>
    </group>
  );
}

export function DiningTable(props: G) {
  return (
    <group {...props}>
      <mesh position={[0, 0.74, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.06, 0.85]} />
        <Mat color={C.wood} rough={0.6} />
      </mesh>
      {[[-0.62, -0.36], [0.62, -0.36], [-0.62, 0.36], [0.62, 0.36]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.36, z]}>
          <boxGeometry args={[0.06, 0.72, 0.06]} />
          <Mat color={C.woodDark} />
        </mesh>
      ))}
      <mesh position={[0, 0.83, 0]}>
        <cylinderGeometry args={[0.1, 0.08, 0.14, 16]} />
        <meshStandardMaterial color={C.glass} roughness={0.1} transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

export function Chair({ color = C.wood, ...props }: G & { color?: string }) {
  return (
    <group {...props}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.44, 0.05, 0.44]} />
        <Mat color={color} />
      </mesh>
      <mesh position={[0, 0.72, -0.2]} castShadow>
        <boxGeometry args={[0.44, 0.5, 0.04]} />
        <Mat color={color} />
      </mesh>
      {[[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.22, z]}>
          <boxGeometry args={[0.04, 0.44, 0.04]} />
          <Mat color={C.woodDark} />
        </mesh>
      ))}
    </group>
  );
}

export function Plant(props: G) {
  return (
    <group {...props}>
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.14, 0.4, 16]} />
        <Mat color={C.paper} />
      </mesh>
      <mesh position={[0, 0.72, 0]} castShadow>
        <icosahedronGeometry args={[0.34, 1]} />
        <Mat color={C.leaf} rough={0.9} />
      </mesh>
      <mesh position={[0.1, 1.0, 0.05]} castShadow>
        <icosahedronGeometry args={[0.22, 1]} />
        <Mat color={C.leafDark} rough={0.9} />
      </mesh>
    </group>
  );
}

export function Rug({ size = [2.2, 1.5], color = C.fabricWarm, ...props }: G & { size?: [number, number]; color?: string }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow {...(props as JSX.IntrinsicElements['mesh'])}>
      <planeGeometry args={size} />
      <Mat color={color} rough={1} />
    </mesh>
  );
}

export function Desk(props: G) {
  return (
    <group {...props}>
      <mesh position={[0, 0.74, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.05, 0.7]} />
        <Mat color={C.white} rough={0.5} />
      </mesh>
      {[-0.56, 0.56].map((x) => (
        <mesh key={x} position={[x, 0.37, 0]}>
          <boxGeometry args={[0.05, 0.72, 0.62]} />
          <Mat color={C.greyDark} rough={0.5} />
        </mesh>
      ))}
    </group>
  );
}

export function Monitor(props: G) {
  return (
    <group {...props}>
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[0.24, 0.02, 0.16]} />
        <Mat color={C.greyDark} />
      </mesh>
      <mesh position={[0, 0.16, -0.03]}>
        <boxGeometry args={[0.04, 0.26, 0.04]} />
        <Mat color={C.greyDark} />
      </mesh>
      <mesh position={[0, 0.34, 0]} castShadow>
        <boxGeometry args={[0.62, 0.38, 0.03]} />
        <Mat color={C.screen} rough={0.3} metal={0.3} />
      </mesh>
      <mesh position={[0, 0.34, 0.017]}>
        <planeGeometry args={[0.56, 0.32]} />
        <meshStandardMaterial color="#2C4A72" emissive="#3E6596" emissiveIntensity={0.35} />
      </mesh>
    </group>
  );
}

export function OfficeChair({ color = C.navy2, ...props }: G & { color?: string }) {
  return (
    <group {...props}>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.26, 0.26, 0.04, 5]} />
        <Mat color={C.greyDark} />
      </mesh>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.36, 8]} />
        <Mat color={C.greyDark} metal={0.5} />
      </mesh>
      <RoundedBox args={[0.48, 0.08, 0.46]} radius={0.03} position={[0, 0.47, 0]} castShadow>
        <Mat color={color} rough={0.9} />
      </RoundedBox>
      <RoundedBox args={[0.46, 0.5, 0.07]} radius={0.03} position={[0, 0.78, -0.22]} castShadow>
        <Mat color={color} rough={0.9} />
      </RoundedBox>
    </group>
  );
}

export function MeetingTable(props: G) {
  return (
    <group {...props}>
      <RoundedBox args={[2.0, 0.06, 1.0]} radius={0.03} position={[0, 0.74, 0]} castShadow receiveShadow>
        <Mat color={C.woodLight} rough={0.5} />
      </RoundedBox>
      <mesh position={[0, 0.37, 0]}>
        <boxGeometry args={[1.2, 0.72, 0.12]} />
        <Mat color={C.greyDark} />
      </mesh>
    </group>
  );
}

export function Cabinet({ drawers = 3, ...props }: G & { drawers?: number }) {
  const h = drawers * 0.38;
  return (
    <group {...props}>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.6, h, 0.6]} />
        <Mat color="#D9DDE3" rough={0.45} metal={0.2} />
      </mesh>
      {Array.from({ length: drawers }, (_, i) => (
        <mesh key={i} position={[0, 0.19 + i * 0.38, 0.302]}>
          <boxGeometry args={[0.2, 0.03, 0.02]} />
          <Mat color={C.navy} />
        </mesh>
      ))}
    </group>
  );
}

export function ServerRack(props: G) {
  return (
    <group {...props}>
      <mesh position={[0, 0.95, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 1.9, 0.7]} />
        <Mat color="#232A35" rough={0.5} metal={0.3} />
      </mesh>
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[0.12, 0.4 + i * 0.24, 0.352]}>
          <boxGeometry args={[0.04, 0.03, 0.005]} />
          <meshStandardMaterial color="#7CE0A8" emissive="#3FCB86" emissiveIntensity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

export function Printer(props: G) {
  return (
    <group {...props}>
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[0.7, 0.7, 0.6]} />
        <Mat color="#E1E4E8" rough={0.5} />
      </mesh>
      <mesh position={[0, 0.82, 0]} castShadow>
        <boxGeometry args={[0.6, 0.24, 0.5]} />
        <Mat color={C.greyDark} rough={0.5} />
      </mesh>
    </group>
  );
}

/** Stylised mover in a navy uniform with an amber cap. */
export function Mover({
  carrying = false,
  walking = false,
  moving,
  phase = 0,
  ...props
}: G & {
  carrying?: boolean;
  walking?: boolean;
  /** When provided, legs only stride while this is true and settle when the mover stands still. */
  moving?: MutableRefObject<boolean>;
  phase?: number;
}) {
  const legL = useRef<THREE.Mesh>(null);
  const legR = useRef<THREE.Mesh>(null);
  const body = useRef<THREE.Group>(null);
  const stride = useRef(0);

  useFrame(({ clock }, dt) => {
    if (!walking) return;
    const target = moving && !moving.current ? 0 : 1;
    stride.current += (target - stride.current) * (1 - Math.exp(-dt * 10));
    const t = clock.elapsedTime * 6 + phase;
    const s = stride.current;
    if (legL.current) legL.current.rotation.x = Math.sin(t) * 0.45 * s;
    if (legR.current) legR.current.rotation.x = -Math.sin(t) * 0.45 * s;
    if (body.current) body.current.position.y = Math.abs(Math.sin(t)) * 0.03 * s;
  });

  return (
    <group {...props}>
      <group ref={body}>
        <mesh ref={legL} position={[-0.1, 0.42, 0]} castShadow>
          <capsuleGeometry args={[0.075, 0.55, 4, 8]} />
          <Mat color="#26324A" />
        </mesh>
        <mesh ref={legR} position={[0.1, 0.42, 0]} castShadow>
          <capsuleGeometry args={[0.075, 0.55, 4, 8]} />
          <Mat color="#26324A" />
        </mesh>
        <mesh position={[0, 1.08, 0]} castShadow>
          <capsuleGeometry args={[0.2, 0.42, 4, 12]} />
          <Mat color={C.navy2} />
        </mesh>
        <mesh position={[0, 1.18, 0.19]}>
          <boxGeometry args={[0.16, 0.05, 0.02]} />
          <Mat color={C.amber} />
        </mesh>
        <mesh position={[0, 1.56, 0]} castShadow>
          <sphereGeometry args={[0.15, 16, 16]} />
          <Mat color={C.skin} rough={0.8} />
        </mesh>
        <mesh position={[0, 1.66, 0.02]}>
          <sphereGeometry args={[0.155, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <Mat color={C.amber} />
        </mesh>
        <mesh position={[0, 1.66, 0.13]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[0.2, 0.02, 0.12]} />
          <Mat color={C.amber} />
        </mesh>
        {carrying ? (
          <>
            {[-0.2, 0.2].map((x) => (
              <mesh key={x} position={[x, 1.08, 0.18]} rotation={[-1.2, 0, 0]}>
                <capsuleGeometry args={[0.055, 0.32, 4, 8]} />
                <Mat color={C.navy2} />
              </mesh>
            ))}
            <Carton position={[0, 0.98, 0.36]} size={[0.44, 0.34, 0.36]} />
          </>
        ) : (
          [-0.25, 0.25].map((x) => (
            <mesh key={x} position={[x, 1.02, 0]} rotation={[0, 0, x > 0 ? -0.12 : 0.12]}>
              <capsuleGeometry args={[0.055, 0.42, 4, 8]} />
              <Mat color={C.navy2} />
            </mesh>
          ))
        )}
      </group>
    </group>
  );
}
