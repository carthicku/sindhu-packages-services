import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { getQuality, prefersReducedMotion } from '../../../lib/device';
import { SceneCanvas } from '../SceneCanvas';
import { Lights } from '../models/Lights';
import { Carton, Mover, WrapRoll } from '../models/Props';
import { Truck } from '../models/Truck';
import { Ground, HouseExterior, Road, StreetLamp, Tree } from '../models/World';
import { easeInCubic, easeInOut, easeOutCubic, lerp, ss } from './math';

const ROAD_Z = 3.6;
const HOUSE_X = 4.6;
const PARK_X = 2.7;
const START_X = -30;
const END_X = 36;
const DRIVE_START = 0.5;
const DRIVE_TIME = 3.6;
const PARK_TIME = 5;
const LEAVE_TIME = 3.2;
const GAP = 1.2;
/** One loop: arrive, park at the house, drive off, pause off-screen. */
const CYCLE = DRIVE_TIME + PARK_TIME + LEAVE_TIME + GAP;
const LAP = END_X - START_X;

/** Truck position for time t, plus the distance covered in earlier loops (for wheel rotation). */
function truckAt(t: number) {
  if (t < DRIVE_START) return { x: START_X, travelled: 0, c: 0 };
  const u = t - DRIVE_START;
  const lap = Math.floor(u / CYCLE);
  const c = u - lap * CYCLE;
  let x: number;
  if (c < DRIVE_TIME) x = lerp(START_X, PARK_X, easeOutCubic(c / DRIVE_TIME));
  else if (c < DRIVE_TIME + PARK_TIME) x = PARK_X;
  else if (c < DRIVE_TIME + PARK_TIME + LEAVE_TIME) x = lerp(PARK_X, END_X, easeInCubic((c - DRIVE_TIME - PARK_TIME) / LEAVE_TIME));
  else x = END_X;
  return { x, travelled: lap * LAP + (x - START_X), c };
}

const CARTONS: { pos: [number, number, number]; size?: [number, number, number]; rot?: number }[] = [
  { pos: [HOUSE_X - 1.5, 0.12, 1.85] },
  { pos: [HOUSE_X - 0.98, 0.12, 1.95], rot: 0.25 },
  { pos: [HOUSE_X - 1.25, 0.52, 1.9], size: [0.42, 0.34, 0.42], rot: -0.15 },
  { pos: [HOUSE_X + 1.4, 0.12, 1.9], size: [0.6, 0.46, 0.5] },
  { pos: [HOUSE_X + 2.0, 0.12, 2.1], rot: -0.3 },
  { pos: [HOUSE_X + 1.62, 0.58, 1.95], size: [0.4, 0.32, 0.4], rot: 0.2 },
];

function HeroWorld() {
  const reduced = useMemo(prefersReducedMotion, []);
  const quality = getQuality();
  const { camera, size } = useThree();
  const truck = useRef<THREE.Group>(null);
  const travel = useRef(0);
  const walker = useRef<THREE.Group>(null);
  const walkerMoving = useRef(false);
  const start = useRef<number | null>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const look = useRef(new THREE.Vector3());
  const tmp = useMemo(() => ({ pos: new THREE.Vector3(), target: new THREE.Vector3() }), []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useFrame(({ clock }, dt) => {
    if (start.current === null) start.current = clock.elapsedTime;
    // Reduced motion: hold the parked moment instead of looping.
    const t = reduced ? DRIVE_START + DRIVE_TIME + 2.5 : clock.elapsedTime - start.current;

    // Truck loops: enters, decelerates to a stop at the property, waits, then drives on
    const { x, travelled, c } = truckAt(t);
    travel.current = travelled;
    truck.current?.position.set(x, 0, ROAD_Z);

    // While the truck is parked, a mover walks to its rear and back to the house
    if (walker.current) {
      const parkEnd = DRIVE_TIME + PARK_TIME;
      const w = ss(DRIVE_TIME - 0.2, DRIVE_TIME + 1.8, c) * (1 - ss(parkEnd - 1.9, parkEnd - 0.1, c));
      const prevX = walker.current.position.x;
      const prevZ = walker.current.position.z;
      walker.current.position.set(lerp(HOUSE_X - 0.4, PARK_X - 2.6, w), 0.12 * (1 - ss(0.55, 0.75, w)), lerp(2.4, ROAD_Z - 1.15, w));
      const dx = walker.current.position.x - prevX;
      const dz = walker.current.position.z - prevZ;
      walkerMoving.current = Math.abs(dx) + Math.abs(dz) > 0.0005;
      if (walkerMoving.current) walker.current.rotation.y = Math.atan2(dx, dz);
    }

    // Cinematic camera: a gentle push-in after the first arrival, plus pointer parallax
    const narrow = size.width / size.height < 0.95;
    const settle = reduced ? 1 : easeInOut((t - (DRIVE_START + DRIVE_TIME - 0.6)) / 2.6);
    if (narrow) {
      tmp.target.set(lerp(3.6, 3.4, settle), lerp(8.6, 8.3, settle), 0.5);
      tmp.pos.set(lerp(9.5, 8, settle), lerp(13, 12, settle), lerp(42, 39, settle));
    } else {
      tmp.target.set(lerp(0.2, 0.6, settle), lerp(2.6, 2.4, settle), 0.5);
      tmp.pos.set(lerp(7.5, 5.5, settle), lerp(7.6, 6.6, settle), lerp(25, 23, settle));
    }
    if (!reduced) {
      tmp.pos.x += pointer.current.x * 0.5;
      tmp.pos.y += -pointer.current.y * 0.25;
    }
    const k = reduced ? 1 : 1 - Math.exp(-dt * 3);
    camera.position.lerp(tmp.pos, k);
    if (look.current.lengthSq() === 0) look.current.copy(tmp.target);
    look.current.lerp(tmp.target, k);
    camera.lookAt(look.current);
  });

  return (
    <>
      <fog attach="fog" args={['#F1EDE6', 28, 70]} />
      <Lights shadowSize={13} />
      <Ground size={200} />
      <Road from={-60} to={60} z={ROAD_Z} />
      <HouseExterior position={[HOUSE_X, 0, -0.9]} />
      {CARTONS.map((c, i) => (
        <Carton key={i} position={c.pos} rotation={[0, c.rot ?? 0, 0]} size={c.size} />
      ))}
      <WrapRoll position={[HOUSE_X - 2.0, 0.12, 1.55]} />
      <Mover position={[HOUSE_X + 0.9, 0.12, 2.15]} rotation={[0, -0.5, 0]} carrying />
      <group ref={walker} position={[HOUSE_X - 0.4, 0.12, 2.4]}>
        <Mover walking={!reduced} moving={walkerMoving} />
      </group>
      <Truck ref={truck} position={[START_X, 0, ROAD_Z]} travel={travel} />

      {/* Neighbourhood depth */}
      <Tree position={[-3.5, 0, 0.6]} scale={1.3} />
      <Tree position={[-7.5, 0, -1.6]} scale={1.6} />
      <Tree position={[11.2, 0, -2.2]} scale={1.5} />
      <Tree position={[-12, 0, 1.2]} scale={1.2} />
      {quality === 'high' && (
        <>
          <mesh position={[-9.5, 1.6, -5]} castShadow receiveShadow>
            <boxGeometry args={[4, 3.2, 3]} />
            <meshStandardMaterial color="#DCD6CB" roughness={0.9} />
          </mesh>
          <mesh position={[13.5, 2.2, -6]} castShadow>
            <boxGeometry args={[4.5, 4.4, 3]} />
            <meshStandardMaterial color="#CDD3DC" roughness={0.9} />
          </mesh>
          <Tree position={[-1.5, 0, -3.8]} scale={1.1} />
        </>
      )}
      {[-14, -7, 12].map((x) => (
        <StreetLamp key={x} position={[x, 0, ROAD_Z - 1.9]} />
      ))}
    </>
  );
}

export default function HeroScene() {
  return (
    <SceneCanvas camera={{ position: [7.5, 7.6, 25], fov: 30 }}>
      <HeroWorld />
    </SceneCanvas>
  );
}
