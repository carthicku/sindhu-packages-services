import { ContactShadows } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef, type MutableRefObject } from 'react';
import * as THREE from 'three';
import { getQuality } from '../../../lib/device';
import { SceneCanvas } from '../SceneCanvas';
import { homeCartons, homeLayout, officeCartons, officeLayout, renderItem, zones, type LayoutItem } from '../models/interiors';
import { Lights } from '../models/Lights';
import { C } from '../models/palette';
import { Mover, Plant, Rug } from '../models/Props';
import { TRUCK_REAR, Truck } from '../models/Truck';
import { CutawayShell, Ground, Partition, Road, StreetLamp, Tree } from '../models/World';
import { arc, clamp, easeInOut, easeOutCubic, lerp, ss } from './math';

export type JourneyKind = 'home' | 'office';

type Props = {
  kind: JourneyKind;
  /** Scroll position mapped to 0–4: current space, packing, loading, transport, arrival. */
  progress: MutableRefObject<number>;
  /** Highlighted area in the starting space (stage 1 only). */
  focus: string | null;
  reducedMotion: boolean;
};

const ORIGIN = new THREE.Vector3(-14, 0, 0);
const DEST = new THREE.Vector3(14, 0, 0);
const ROAD_Z = 5.6;
const PARK_O = ORIGIN.x + 4.7;
const PARK_D = DEST.x + 4.7;
const START_X = ORIGIN.x - 22;
const STAGING = new THREE.Vector3(ORIGIN.x + 1.1, 0, 3.35);

/** Truck x position along the road for a given journey progress. */
function truckX(p: number) {
  if (p < 1.1) return START_X;
  if (p < 1.65) return lerp(START_X, PARK_O, easeOutCubic((p - 1.1) / 0.55));
  if (p < 2.55) return PARK_O;
  if (p < 3.45) return lerp(PARK_O, PARK_D, easeInOut((p - 2.55) / 0.9));
  return PARK_D;
}

const doorAmount = (p: number) => ss(1.62, 1.76, p) * (1 - ss(2.42, 2.54, p)) + ss(3.45, 3.58, p);

type Moving = LayoutItem & { isCarton: boolean; origin: THREE.Vector3; dest: THREE.Vector3; stage: THREE.Vector3; order: number };

function buildItems(kind: JourneyKind): Moving[] {
  const layout = kind === 'home' ? homeLayout : officeLayout;
  const cartons = kind === 'home' ? homeCartons : officeCartons;
  const all = [...cartons.map((c) => ({ ...c, isCarton: true })), ...layout.map((l) => ({ ...l, isCarton: false }))];
  return all.map((item, i) => {
    const local = new THREE.Vector3(item.pos[0], item.y ?? 0, item.pos[1]);
    const slot = i < cartons.length ? i : 0;
    const stage = new THREE.Vector3(
      STAGING.x + (slot % 3) * 0.52,
      Math.floor(slot / 6) * 0.41,
      STAGING.z + (Math.floor(slot / 3) % 2) * 0.52,
    );
    return { ...item, origin: local.clone().add(ORIGIN), dest: local.clone().add(DEST), stage, order: i };
  });
}

function JourneyWorld({ kind, progress, focus, reducedMotion }: Props) {
  const quality = getQuality();
  const items = useMemo(() => buildItems(kind), [kind]);
  const itemRefs = useRef<(THREE.Group | null)[]>([]);
  const truck = useRef<THREE.Group>(null);
  const travel = useRef(0);
  const door = useRef(0);
  const route = useRef<THREE.Mesh>(null);
  const routeGuide = useRef<THREE.MeshStandardMaterial>(null);
  const moverA = useRef<THREE.Group>(null);
  const moverB = useRef<THREE.Group>(null);
  const marker = useRef<THREE.Group>(null);
  const welcome = useRef<THREE.PointLight>(null);
  const smooth = useRef(progress.current);
  const lookAt = useRef(new THREE.Vector3(ORIGIN.x, 0.6, 0.3));
  const follow = useRef(new THREE.Vector3(ORIGIN.x, 0, 0));
  const { camera, size } = useThree();

  const wrapMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: C.wrap, transparent: true, opacity: 0, roughness: 0.2, metalness: 0.05, depthWrite: false }),
    [],
  );

  // Anchored at its left end so scaling x draws the line forward.
  const routeGeometry = useMemo(() => new THREE.PlaneGeometry(PARK_D - PARK_O, 0.14).translate((PARK_D - PARK_O) / 2, 0, 0), []);

  const K = items.length;
  const tmp = useMemo(() => ({ a: new THREE.Vector3(), b: new THREE.Vector3(), t: new THREE.Vector3(), cp: new THREE.Vector3() }), []);
  const { doorO, doorD, moverPaths, cameraKeys } = useMemo(() => {
    const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
    const doorO = v(PARK_O - TRUCK_REAR - 0.25, 0.85, ROAD_Z);
    const doorD = v(PARK_D - TRUCK_REAR - 0.25, 0.85, ROAD_Z);
    // Each mover walks back and forth between two points; one set per phase (packing, loading, arrival).
    const moverPaths: [THREE.Vector3, THREE.Vector3, THREE.Vector3, THREE.Vector3][] = [
      [v(ORIGIN.x - 1.4, 0, 1.6), v(STAGING.x - 0.4, 0, STAGING.z + 0.2), v(ORIGIN.x + 2.3, 0, 0.9), v(STAGING.x + 1.6, 0, STAGING.z - 0.3)],
      [v(STAGING.x, 0, STAGING.z + 0.9), v(doorO.x - 0.5, 0, ROAD_Z - 0.4), v(ORIGIN.x + 0.6, 0, 1.8), v(doorO.x - 0.6, 0, ROAD_Z + 0.9)],
      [v(doorD.x - 0.6, 0, ROAD_Z - 0.4), v(DEST.x + 1.5, 0, 3.4), v(doorD.x - 0.8, 0, ROAD_Z + 0.9), v(DEST.x - 0.6, 0, 1.9)],
    ];
    // Camera (target, offset) per stage: current space, packing, loading, transport, arrival.
    const cameraKeys: [THREE.Vector3, THREE.Vector3][] = [
      [v(ORIGIN.x + 0.2, 0.6, 0.6), v(9, 11, 16.5)],
      [v(ORIGIN.x + 1.3, 0.6, 1.9), v(8.5, 9.6, 16)],
      [v(PARK_O - 2.6, 0.8, 3.4), v(7.5, 8.2, 17.5)],
      [v(PARK_O, 1.0, ROAD_Z - 0.6), v(1, 7.6, 18.5)],
      [v(DEST.x + 1.4, 0.6, 1.6), v(8.5, 9.8, 16.5)],
    ];
    return { doorO, doorD, moverPaths, cameraKeys };
  }, []);

  useFrame(({ clock }, dt) => {
    const target = clamp(progress.current, 0, 4);
    if (reducedMotion) smooth.current = Math.round(target);
    else smooth.current += (target - smooth.current) * (1 - Math.exp(-dt * 4.5));
    const p = smooth.current;
    const time = clock.elapsedTime;

    // Truck
    const tx = truckX(p);
    travel.current = tx - START_X;
    door.current = doorAmount(p);
    truck.current?.position.set(tx, 0, ROAD_Z);

    // Route line drawn behind the truck between the two sites
    const routeT = clamp((tx - PARK_O) / (PARK_D - PARK_O), 0, 1);
    if (route.current) {
      route.current.scale.x = Math.max(routeT, 0.0001);
      route.current.visible = routeT > 0.001;
    }
    if (routeGuide.current) routeGuide.current.opacity = 0.35 * ss(2.2, 2.6, p);

    // Protective wrap appears while packing and comes off after arrival
    wrapMaterial.opacity = 0.82 * ss(0.6, 1.0, p) * (1 - ss(3.82, 3.98, p));

    // Belongings
    for (let k = 0; k < K; k++) {
      const g = itemRefs.current[k];
      if (!g) continue;
      const it = items[k];
      const loadStart = 1.74 + (k / K) * 0.52;
      const unloadStart = 3.56 + (k / K) * 0.3;
      const l = ss(loadStart, loadStart + 0.16, p);
      const u = ss(unloadStart, unloadStart + 0.12, p);
      let scale = 1;

      if (u > 0) {
        arc(doorD, it.dest, u, 1.1, tmp.t);
        scale = lerp(0.3, 1, u);
      } else if (l >= 1) {
        scale = 0;
        tmp.t.copy(doorD);
      } else {
        // Before loading: at home, or carried out to the staging area (cartons)
        if (it.isCarton) {
          const appear = ss(0.55 + it.order * 0.03, 0.75 + it.order * 0.03, p);
          const toStage = ss(0.95 + it.order * 0.035, 1.2 + it.order * 0.035, p);
          arc(it.origin, it.stage, toStage, 0.45, tmp.a);
          scale = appear;
        } else {
          tmp.a.copy(it.origin);
        }
        if (l > 0) {
          arc(tmp.a, doorO, l, 1.2, tmp.t);
          scale *= lerp(1, 0.3, l);
        } else tmp.t.copy(tmp.a);
      }
      g.position.copy(tmp.t);
      g.scale.setScalar(Math.max(scale, 0.0001));
      g.visible = scale > 0.002;
    }

    // Movers: appear for packing, ride along in transit, help unload on arrival
    const present = ss(0.45, 0.62, p) * (1 - ss(2.46, 2.56, p)) + ss(3.46, 3.56, p);
    const sway = reducedMotion ? 0.5 : 0.5 + 0.5 * Math.sin(time * 0.9);
    const sway2 = reducedMotion ? 0.5 : 0.5 + 0.5 * Math.sin(time * 0.9 + 2.1);
    const placeMover = (g: THREE.Group | null, s: number, a: THREE.Vector3, b: THREE.Vector3) => {
      if (!g) return;
      tmp.cp.lerpVectors(a, b, s);
      const prevX = g.position.x;
      const prevZ = g.position.z;
      g.position.copy(tmp.cp);
      const dx = g.position.x - prevX;
      const dz = g.position.z - prevZ;
      if (Math.abs(dx) + Math.abs(dz) > 0.0005) g.rotation.y = Math.atan2(dx, dz);
      g.scale.setScalar(Math.max(present, 0.0001));
      g.visible = present > 0.01;
    };
    const phase = p < 1.6 ? 0 : p < 3.4 ? 1 : 2;
    const [a1, b1, a2, b2] = moverPaths[phase];
    placeMover(moverA.current, sway, a1, b1);
    placeMover(moverB.current, sway2, a2, b2);

    // Highlight marker for the selected area
    const zone = focus ? zones[focus] : null;
    const focusWeight = zone ? 1 - ss(0.35, 0.75, p) : 0;
    if (marker.current) {
      marker.current.visible = focusWeight > 0.01;
      if (zone) {
        marker.current.position.set(ORIGIN.x + zone[0], 0.03, zone[1]);
        const pulse = reducedMotion ? 1 : 1 + Math.sin(time * 3) * 0.06;
        marker.current.scale.setScalar(focusWeight * pulse);
      }
    }

    if (welcome.current) welcome.current.intensity = 6 * ss(3.75, 4, p);

    // Camera keyframes (target, offset) blended between stages
    const narrow = size.width / size.height < 0.9;
    const keys = cameraKeys;
    keys[3][0].set(tx - 0.5, 1.0, ROAD_Z - 0.6); // transport stage follows the truck
    const i = Math.min(Math.floor(p), 3);
    const f = easeInOut(clamp(p - i, 0, 1));
    tmp.t.lerpVectors(keys[i][0], keys[i + 1][0], f);
    tmp.cp.lerpVectors(keys[i][1], keys[i + 1][1], f);
    if (zone && focusWeight > 0) {
      tmp.t.lerp(tmp.b.set(ORIGIN.x + zone[0], 0.5, zone[1]), 0.45 * focusWeight);
      tmp.cp.multiplyScalar(1 - 0.22 * focusWeight);
    }
    if (narrow) tmp.cp.multiplyScalar(1.45);
    const desired = tmp.cp.add(tmp.t);
    const k = reducedMotion ? 1 : 1 - Math.exp(-dt * 5);
    camera.position.lerp(desired, k);
    lookAt.current.lerp(tmp.t, k);
    camera.lookAt(lookAt.current);
    follow.current.copy(lookAt.current);
  });

  const isHome = kind === 'home';

  return (
    <>
      <Lights follow={follow} shadowSize={11} />
      <Ground size={180} />
      <Road from={START_X - 6} to={PARK_D + 12} z={ROAD_Z} />

      {/* Route line along the kerb, drawn as the truck travels */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[(PARK_O + PARK_D) / 2, 0.02, ROAD_Z + 1.56]}>
        <planeGeometry args={[PARK_D - PARK_O, 0.05]} />
        <meshStandardMaterial ref={routeGuide} color={C.amber} transparent opacity={0} />
      </mesh>
      <mesh ref={route} geometry={routeGeometry} position={[PARK_O, 0.025, ROAD_Z + 1.56]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color={C.amber} emissive={C.amber} emissiveIntensity={0.35} />
      </mesh>
      {[PARK_O, PARK_D].map((x) => (
        <group key={x} position={[x, 0, ROAD_Z + 1.56]}>
          <mesh position={[0, 0.06, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.08, 24]} />
            <meshStandardMaterial color={C.amber} />
          </mesh>
        </group>
      ))}

      {/* Starting space */}
      <group position={ORIGIN.toArray()}>
        <CutawayShell
          variant={kind}
          floor={isHome ? C.woodLight : '#D9DDE2'}
          wall={isHome ? C.wall : '#ECEEF1'}
        />
        {isHome ? (
          <>
            <Partition from={[1.4, -2.5]} to={[1.4, 0.2]} />
            <Rug position={[-2.0, 0.025, 0.2]} size={[2.6, 1.9]} />
          </>
        ) : (
          <>
            <Partition from={[-3.5, -0.3]} to={[-0.9, -0.3]} glass />
            <Partition from={[-0.9, -0.3]} to={[-0.9, -2.5]} glass />
          </>
        )}
      </group>

      {/* New space */}
      <group position={DEST.toArray()}>
        <CutawayShell
          variant={kind}
          floor={isHome ? '#CFAE84' : '#D3D8DF'}
          wall={isHome ? C.wallWarm : '#EEF0F3'}
        />
        {isHome ? (
          <>
            <Partition from={[1.4, -2.5]} to={[1.4, 0.2]} />
            <Rug position={[-2.0, 0.025, 0.2]} size={[2.6, 1.9]} color="#D8C6AE" />
            <Plant position={[-3.1, 0, 2.0]} />
          </>
        ) : (
          <>
            <Partition from={[-3.5, -0.3]} to={[-0.9, -0.3]} glass />
            <Partition from={[-0.9, -0.3]} to={[-0.9, -2.5]} glass />
            <Plant position={[3.1, 0, 2.0]} />
          </>
        )}
        <pointLight ref={welcome} position={[0, 2.1, 0.5]} color="#FFC98A" intensity={0} distance={9} decay={1.6} />
      </group>

      {/* Belongings that travel from one space to the other */}
      {items.map((it, k) => (
        <group key={k} ref={(el) => (itemRefs.current[k] = el)} position={it.origin.toArray()}>
          <group rotation={[0, it.rot ?? 0, 0]}>
            {renderItem(it)}
            {it.wrap && (
              <mesh position={[0, it.size[1] / 2 + 0.01, 0]} material={wrapMaterial}>
                <boxGeometry args={[it.size[0] * 1.06, it.size[1] * 1.04, it.size[2] * 1.06]} />
              </mesh>
            )}
          </group>
        </group>
      ))}

      <group ref={moverA}>
        <Mover carrying walking={!reducedMotion} />
      </group>
      <group ref={moverB}>
        <Mover walking={!reducedMotion} phase={1.4} />
      </group>

      <group ref={marker} visible={false}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.9, 1.02, 48]} />
          <meshBasicMaterial color={C.amber} transparent opacity={0.9} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.9, 48]} />
          <meshBasicMaterial color={C.amber} transparent opacity={0.12} />
        </mesh>
        <mesh position={[0, 2.9, 0]}>
          <sphereGeometry args={[0.13, 16, 16]} />
          <meshStandardMaterial color={C.amber} emissive={C.amber} emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0, 2.5, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.8, 6]} />
          <meshBasicMaterial color={C.amber} />
        </mesh>
      </group>

      <Truck ref={truck} position={[START_X, 0, ROAD_Z]} travel={travel} door={door} />

      <Scenery quality={quality} />
      {quality === 'low' && <ContactShadows position={[0, 0.01, 0]} scale={80} opacity={0.25} blur={2.5} far={4} frames={1} />}
    </>
  );
}

/** Stylised neighbourhood between the two sites, suggesting a journey without naming a route. */
function Scenery({ quality }: { quality: 'high' | 'low' }) {
  const step = quality === 'high' ? 2.6 : 4.2;
  const trees: [number, number, number][] = [];
  for (let x = -9; x <= 9; x += step) {
    trees.push([x, ROAD_Z - 2.3, 0.9 + ((x * 7) % 3) * 0.12]);
    trees.push([x + 1.2, ROAD_Z + 2.8, 1 + ((x * 5) % 2) * 0.15]);
  }
  for (let x = START_X; x < ORIGIN.x - 5; x += step * 1.4) trees.push([x, ROAD_Z - 2.6, 1.1]);
  const blocks: [number, number, number, string][] = [
    [-6.5, 2.2, 1.6, '#D8D3C9'],
    [-3.2, 3.4, 2.0, '#C9CFD8'],
    [0.4, 1.8, 1.8, '#E2DCCF'],
    [3.6, 2.8, 1.5, '#CDD4DE'],
    [7.0, 2.0, 1.9, '#DCD5C8'],
  ];
  return (
    <group>
      {trees.map(([x, z, s], i) => (
        <Tree key={i} position={[x, 0, z]} scale={s} />
      ))}
      {quality === 'high' &&
        blocks.map(([x, h, w, color], i) => (
          <mesh key={i} position={[x, h / 2, -1.2]} castShadow receiveShadow>
            <boxGeometry args={[w, h, 1.6]} />
            <meshStandardMaterial color={color} roughness={0.9} />
          </mesh>
        ))}
      {/* Lamps sit behind the road so they never block the truck from the camera. */}
      {[-7, -2, 3, 8].map((x) => (
        <StreetLamp key={x} position={[x, 0, ROAD_Z - 1.75]} />
      ))}
    </group>
  );
}

export default function JourneyScene(props: Props) {
  return (
    <SceneCanvas camera={{ position: [ORIGIN.x + 6.5, 8.2, 11.8], fov: 30 }}>
      <JourneyWorld {...props} />
    </SceneCanvas>
  );
}
