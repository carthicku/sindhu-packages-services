import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, type ReactNode } from 'react';
import * as THREE from 'three';
import { prefersReducedMotion } from '../../../lib/device';
import { SceneCanvas } from '../SceneCanvas';
import { Lights } from '../models/Lights';
import { C, LABELS } from '../models/palette';
import { Bed, Carton, Desk, Monitor, OfficeChair, Plant, Sofa, TapeRoll, WrapRoll } from '../models/Props';
import { Truck } from '../models/Truck';
import { HouseExterior, OfficeTower, Tree } from '../models/World';

type SetId = 'home' | 'office' | 'packing' | 'local' | 'long' | 'default';

type Props = {
  moveType: string;
  homeSize: string;
  workstations: string;
  propertyKind: string;
};

const CARTON_COUNT: Record<string, number> = { studio: 3, '1bhk': 5, '2bhk': 7, '3bhk': 9, '4bhk': 12 };
const DESK_COUNT: Record<string, number> = { '1-10': 1, '11-25': 2, '26-50': 3, '51-100': 4, '100+': 4 };

const cartonSlots: [number, number, number][] = [
  [1.2, 0, 1.2], [1.72, 0, 1.3], [1.45, 0.4, 1.25], [2.1, 0, 0.7], [1.6, 0, 0.6],
  [1.85, 0.4, 0.65], [0.7, 0, 1.6], [2.3, 0, 1.4], [1.3, 0.8, 1.22], [0.6, 0, 0.9],
  [2.35, 0.4, 0.72], [0.65, 0.4, 1.55],
];

function setFor(p: Props): SetId {
  switch (p.moveType) {
    case 'home':
      return 'home';
    case 'office':
      return 'office';
    case 'packing':
      return 'packing';
    case 'local':
      return 'local';
    case 'long-distance':
      return 'long';
    default:
      return 'default';
  }
}

/** Scales its children in and out smoothly as the active set changes. */
function Presence({ active, children, reduced }: { active: boolean; children: ReactNode; reduced: boolean }) {
  const g = useRef<THREE.Group>(null);
  const s = useRef(active ? 1 : 0);
  useFrame((_, dt) => {
    const target = active ? 1 : 0;
    s.current = reduced ? target : s.current + (target - s.current) * (1 - Math.exp(-dt * 6));
    if (!g.current) return;
    g.current.scale.setScalar(Math.max(s.current, 0.0001));
    g.current.visible = s.current > 0.01;
  });
  return <group ref={g}>{children}</group>;
}

function RouteSet({ long, reduced }: { long: boolean; reduced: boolean }) {
  const curve = useMemo(
    () =>
      long
        ? new THREE.CatmullRomCurve3([
            new THREE.Vector3(-3.0, 0.06, 1.4),
            new THREE.Vector3(-1.6, 0.06, 0.2),
            new THREE.Vector3(-0.2, 0.06, 1.2),
            new THREE.Vector3(1.2, 0.06, -0.2),
            new THREE.Vector3(2.9, 0.06, -1.4),
          ])
        : new THREE.CatmullRomCurve3([
            new THREE.Vector3(-1.7, 0.06, 0.9),
            new THREE.Vector3(0, 0.06, 1.5),
            new THREE.Vector3(1.7, 0.06, 0.9),
          ]),
    [long],
  );
  const tube = useMemo(() => new THREE.TubeGeometry(curve, 96, 0.045, 8, false), [curve]);
  const truck = useRef<THREE.Group>(null);
  const travel = useRef(0);
  const tangent = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }) => {
    if (!truck.current) return;
    const period = long ? 9 : 6;
    const raw = reduced ? 0.5 : (clock.elapsedTime % period) / period;
    const t = 0.08 + 0.84 * (raw < 0.85 ? raw / 0.85 : 1);
    const pt = curve.getPointAt(t);
    curve.getTangentAt(t, tangent);
    truck.current.position.set(pt.x, 0.06, pt.z);
    truck.current.rotation.y = Math.atan2(-tangent.z, tangent.x);
    travel.current = t * curve.getLength() * 3;
  });

  const a = curve.getPointAt(0);
  const b = curve.getPointAt(1);
  return (
    <group>
      <mesh geometry={tube}>
        <meshStandardMaterial color={C.amber} emissive={C.amber} emissiveIntensity={0.3} />
      </mesh>
      <HouseExterior position={[a.x - 0.2, 0, a.z - 0.75]} scale={0.16} />
      {long ? (
        <OfficeTower position={[b.x + 0.1, 0, b.z - 0.7]} scale={0.18} />
      ) : (
        <HouseExterior position={[b.x + 0.2, 0, b.z - 0.75]} scale={0.16} />
      )}
      {long && (
        <>
          <Tree position={[-1.4, 0, -1.1]} scale={0.45} />
          <Tree position={[0.4, 0, 2.0]} scale={0.4} />
          <Tree position={[2.2, 0, 0.9]} scale={0.5} />
          <mesh position={[-0.2, 0.25, -1.6]} castShadow>
            <coneGeometry args={[0.9, 0.9, 5]} />
            <meshStandardMaterial color="#B9C4B0" flatShading roughness={1} />
          </mesh>
        </>
      )}
      <group ref={truck} scale={0.3}>
        <Truck travel={travel} />
      </group>
    </group>
  );
}

function PlannerWorld(props: Props) {
  const reduced = useMemo(prefersReducedMotion, []);
  const active = setFor(props);
  const cartonCount =
    active === 'home' ? CARTON_COUNT[props.homeSize] ?? 6 : active === 'office' ? 5 : active === 'packing' ? 8 : active === 'default' ? 4 : 0;
  const deskCount = DESK_COUNT[props.workstations] ?? 2;
  const cartonsRef = useRef<(THREE.Group | null)[]>([]);
  const cartonScale = useRef<number[]>(cartonSlots.map(() => 0));
  const platform = useRef<THREE.Group>(null);
  const desired = useMemo(() => ({ pos: new THREE.Vector3(), look: new THREE.Vector3(), current: new THREE.Vector3(0, 0.6, 0) }), []);

  useFrame(({ camera, clock }, dt) => {
    cartonsRef.current.forEach((g, i) => {
      if (!g) return;
      const target = i < cartonCount ? 1 : 0;
      // Stagger so cartons pop in one after another.
      const rate = reduced ? 1 : 1 - Math.exp(-dt * (8 - i * 0.4));
      cartonScale.current[i] += (target - cartonScale.current[i]) * rate;
      const s = cartonScale.current[i];
      g.scale.setScalar(Math.max(s, 0.0001));
      g.visible = s > 0.01;
    });

    if (platform.current && !reduced) platform.current.rotation.y = Math.sin(clock.elapsedTime * 0.2) * 0.12;

    if (active === 'packing') {
      desired.pos.set(2.6, 3.4, 6.6);
      desired.look.set(1.2, 0.5, 0.9);
    } else if (active === 'long') {
      desired.pos.set(0, 7.4, 8.6);
      desired.look.set(0, 0.2, 0);
    } else {
      desired.pos.set(0.6, 5.2, 9.4);
      desired.look.set(0.2, 0.6, 0.4);
    }
    const k = reduced ? 1 : 1 - Math.exp(-dt * 3);
    camera.position.lerp(desired.pos, k);
    desired.current.lerp(desired.look, k);
    camera.lookAt(desired.current);
  });

  return (
    <group ref={platform}>
      <mesh position={[0, -0.15, 0]} receiveShadow>
        <cylinderGeometry args={[3.9, 4.0, 0.3, 72]} />
        <meshStandardMaterial color={C.paper} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.76, 3.86, 96]} />
        <meshStandardMaterial color={C.amber} />
      </mesh>

      <Presence active={active === 'home'} reduced={reduced}>
        <Sofa position={[-1.3, 0, -0.6]} />
        <Bed position={[-1.5, 0, 1.4]} rotation={[0, Math.PI / 2, 0]} scale={0.8} />
        <Plant position={[-2.9, 0, -1.2]} />
      </Presence>

      <Presence active={active === 'office'} reduced={reduced}>
        {[[-1.9, -0.8], [-0.5, -0.8], [-1.9, 0.9], [-0.5, 0.9]].map(([x, z], i) =>
          i < deskCount ? (
            <group key={i} position={[x, 0, z]}>
              <Desk />
              <Monitor position={[0, 0.765, -0.15]} />
              <OfficeChair position={[0, 0, 0.58]} rotation={[0, Math.PI, 0]} />
            </group>
          ) : null,
        )}
      </Presence>

      <Presence active={active === 'packing'} reduced={reduced}>
        <WrapRoll position={[-0.2, 0, 0.6]} />
        <WrapRoll position={[0.2, 0, 0.2]} />
        <TapeRoll position={[0.6, 0, 1.9]} />
        <TapeRoll position={[0.95, 0, 2.1]} />
        <Carton position={[-0.4, 0, 1.7]} open />
      </Presence>

      <Presence active={active === 'local' || active === 'long'} reduced={reduced}>
        <RouteSet long={active === 'long'} reduced={reduced} />
      </Presence>

      <Presence active={active === 'default'} reduced={reduced}>
        <group position={[-1.2, 0, -0.4]} scale={0.62} rotation={[0, 0.25, 0]}>
          <Truck />
        </group>
      </Presence>

      {cartonSlots.map((pos, i) => (
        <group key={i} ref={(el) => (cartonsRef.current[i] = el)} position={pos} rotation={[0, (i % 3) * 0.2 - 0.2, 0]} scale={0.0001}>
          <Carton label={active === 'office' ? LABELS[i % LABELS.length] : undefined} />
        </group>
      ))}
    </group>
  );
}

export default function PlannerScene(props: Props) {
  return (
    <SceneCanvas camera={{ position: [0.6, 5.2, 9.4], fov: 32 }}>
      <Lights shadowSize={6} />
      <PlannerWorld {...props} />
    </SceneCanvas>
  );
}
