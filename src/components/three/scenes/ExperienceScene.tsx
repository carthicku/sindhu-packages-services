import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { prefersReducedMotion } from '../../../lib/device';
import { SceneCanvas } from '../SceneCanvas';
import { Lights } from '../models/Lights';
import { C, LABELS } from '../models/palette';
import {
  Cabinet,
  Carton,
  Chair,
  CoffeeTable,
  Desk,
  DiningTable,
  Monitor,
  Mover,
  OfficeChair,
  Plant,
  Rug,
  Sofa,
  TapeRoll,
  WrapRoll,
} from '../models/Props';

type Props = { mode: 'home' | 'office' };

function HomeSide() {
  return (
    <group>
      <mesh position={[0, 0.02, 1.7]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[6.4, 3.2]} />
        <meshStandardMaterial color={C.woodLight} roughness={0.75} />
      </mesh>
      {/* Wall art and window on the dividing wall */}
      <mesh position={[-1.6, 1.65, 0.13]}>
        <planeGeometry args={[1.0, 0.7]} />
        <meshStandardMaterial color={C.amberSoft} roughness={0.8} />
      </mesh>
      <mesh position={[1.4, 1.5, 0.13]}>
        <planeGeometry args={[1.5, 1.2]} />
        <meshStandardMaterial color="#CFE0EE" emissive="#BFD7EC" emissiveIntensity={0.3} roughness={0.2} />
      </mesh>
      <Rug position={[-1.6, 0.03, 1.5]} size={[2.4, 1.7]} />
      <Sofa position={[-1.6, 0, 0.75]} />
      <CoffeeTable position={[-1.6, 0, 1.9]} />
      <DiningTable position={[1.5, 0, 1.15]} />
      <Chair position={[1.15, 0, 1.75]} rotation={[0, Math.PI, 0]} />
      <Chair position={[1.85, 0, 1.75]} rotation={[0, Math.PI, 0]} />
      <Plant position={[-2.85, 0, 0.55]} />
      {/* Moving day: cartons, wrapping and a mover preparing belongings */}
      <Carton position={[0.15, 0, 2.55]} />
      <Carton position={[0.68, 0, 2.7]} rotation={[0, 0.3, 0]} />
      <Carton position={[0.38, 0.4, 2.6]} size={[0.42, 0.32, 0.42]} rotation={[0, -0.2, 0]} />
      <Carton position={[2.55, 0, 2.3]} open />
      <WrapRoll position={[-0.35, 0, 2.75]} />
      <TapeRoll position={[1.35, 0, 2.75]} />
      <Mover position={[1.75, 0, 2.55]} rotation={[0, -0.6, 0]} carrying />
    </group>
  );
}

function OfficeSide() {
  return (
    <group rotation={[0, Math.PI, 0]}>
      <mesh position={[0, 0.02, 1.7]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[6.4, 3.2]} />
        <meshStandardMaterial color="#D5DAE1" roughness={0.7} />
      </mesh>
      {/* Whiteboard and windows */}
      <mesh position={[-1.4, 1.55, 0.13]}>
        <planeGeometry args={[1.6, 0.9]} />
        <meshStandardMaterial color={C.white} roughness={0.4} />
      </mesh>
      <mesh position={[-1.4, 1.55, 0.135]}>
        <planeGeometry args={[0.8, 0.04]} />
        <meshStandardMaterial color={C.amber} />
      </mesh>
      <mesh position={[1.5, 1.5, 0.13]}>
        <planeGeometry args={[1.8, 1.2]} />
        <meshStandardMaterial color="#CFE0EE" emissive="#BFD7EC" emissiveIntensity={0.3} roughness={0.2} />
      </mesh>
      {[-1.9, -0.5].map((x) => (
        <group key={x}>
          <Desk position={[x, 0, 0.95]} />
          <Monitor position={[x, 0.765, 0.8]} />
          <OfficeChair position={[x, 0, 1.55]} rotation={[0, Math.PI, 0]} />
        </group>
      ))}
      <Desk position={[0.9, 0, 0.95]} />
      <Cabinet position={[2.6, 0, 0.55]} />
      <Cabinet position={[2.6, 0, 1.2]} drawers={2} />
      {/* Equipment packed and labelled by department */}
      <Carton position={[0.65, 0, 2.3]} label={LABELS[0]} />
      <Carton position={[1.2, 0, 2.45]} label={LABELS[1]} rotation={[0, 0.2, 0]} />
      <Carton position={[0.9, 0.4, 2.35]} label={LABELS[0]} size={[0.44, 0.34, 0.44]} />
      <Carton position={[1.8, 0, 2.2]} label={LABELS[2]} />
      <Carton position={[0.9, 0.79, 0.9]} size={[0.62, 0.3, 0.42]} label={LABELS[1]} />
      <Plant position={[-2.85, 0, 2.6]} />
      <Mover position={[-0.4, 0, 2.6]} rotation={[0, 0.5, 0]} carrying />
    </group>
  );
}

function Turntable({ mode }: Props) {
  const reduced = useMemo(prefersReducedMotion, []);
  const table = useRef<THREE.Group>(null);
  const rot = useRef(mode === 'office' ? Math.PI : 0);
  const { camera, size } = useThree();

  useFrame(({ clock }, dt) => {
    const target = mode === 'office' ? Math.PI : 0;
    rot.current = reduced ? target : rot.current + (target - rot.current) * (1 - Math.exp(-dt * 2.8));
    const mid = Math.sin((rot.current / Math.PI) * Math.PI);
    if (table.current) {
      table.current.rotation.y = rot.current;
      table.current.position.y = mid * 0.28;
    }
    const narrow = size.width / size.height < 1;
    const sway = reduced ? 0 : Math.sin(clock.elapsedTime * 0.25) * 0.35;
    camera.position.set(sway, narrow ? 11 : 8.6, narrow ? 24 : 18);
    camera.lookAt(0, narrow ? 1.2 : 1.0, 0.3);
  });

  return (
    <group ref={table}>
      <mesh position={[0, -0.16, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[4.7, 4.8, 0.3, 72]} />
        <meshStandardMaterial color={C.paper} roughness={0.85} />
      </mesh>
      <mesh position={[0, -0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4.55, 4.66, 96]} />
        <meshStandardMaterial color={C.amber} />
      </mesh>
      {/* Dividing wall between the two worlds */}
      <mesh position={[0, 1.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[6.6, 2.6, 0.24]} />
        <meshStandardMaterial color={C.wall} roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.615, 0]}>
        <boxGeometry args={[6.6, 0.03, 0.25]} />
        <meshStandardMaterial color="#1A2A47" />
      </mesh>
      <HomeSide />
      <OfficeSide />
    </group>
  );
}

export default function ExperienceScene({ mode }: Props) {
  return (
    <SceneCanvas camera={{ position: [0, 8.6, 18], fov: 32 }}>
      <Lights shadowSize={8} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.32, 0]} receiveShadow>
        <circleGeometry args={[30, 48]} />
        <shadowMaterial opacity={0.12} />
      </mesh>
      <Turntable mode={mode} />
    </SceneCanvas>
  );
}
