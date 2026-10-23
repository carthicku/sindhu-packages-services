import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { prefersReducedMotion } from '../../../lib/device';
import { SceneCanvas } from '../SceneCanvas';
import { Lights } from '../models/Lights';
import { C } from '../models/palette';
import { Carton, Mover } from '../models/Props';
import { Truck } from '../models/Truck';
import { Ground, HouseExterior, OfficeTower, Road, StreetLamp, Tree } from '../models/World';

const ROAD_Z = 3.4;

/** Closing scene: the branded truck between a welcoming home and a newly organised office. */
function FinaleWorld() {
  const reduced = useMemo(prefersReducedMotion, []);
  const { camera, size } = useThree();
  const route = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const narrow = size.width / size.height < 1;
    const sway = reduced ? 0 : Math.sin(t * 0.18) * 1.2;
    camera.position.set(sway, narrow ? 7.5 : 5.2, narrow ? 27 : 18.5);
    camera.lookAt(0, 1.6, 0);
    if (route.current && !reduced) route.current.emissiveIntensity = 0.35 + Math.sin(t * 2) * 0.2;
  });

  return (
    <>
      <fog attach="fog" args={['#0F1F3B', 26, 60]} />
      <Lights warm intensity={1.6} shadowSize={14} />
      <Ground size={400} color="#E4DCCF" />
      <Road from={-40} to={40} z={ROAD_Z} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, ROAD_Z + 1.56]}>
        <planeGeometry args={[12.5, 0.12]} />
        <meshStandardMaterial ref={route} color={C.amber} emissive={C.amber} emissiveIntensity={0.4} />
      </mesh>
      {[-6.25, 6.25].map((x) => (
        <mesh key={x} position={[x, 0.06, ROAD_Z + 1.56]}>
          <cylinderGeometry args={[0.16, 0.16, 0.08, 24]} />
          <meshStandardMaterial color={C.amber} />
        </mesh>
      ))}

      <HouseExterior position={[-7.2, 0, -1.2]} rotation={[0, 0.18, 0]} />
      <OfficeTower position={[7.4, 0, -1.2]} rotation={[0, -0.18, 0]} />
      <Truck position={[0.4, 0, ROAD_Z]} />

      <Carton position={[-5.2, 0.12, 1.6]} />
      <Carton position={[-4.65, 0.12, 1.75]} rotation={[0, 0.3, 0]} />
      <Carton position={[5.3, 0.12, 1.4]} label={C.navy3} />
      <Mover position={[-2.2, 0, 2.3]} rotation={[0, 0.6, 0]} carrying />
      <Mover position={[3.4, 0, 2.2]} rotation={[0, -0.7, 0]} />

      <Tree position={[-12, 0, 0.5]} scale={1.4} />
      <Tree position={[12.5, 0, 0.2]} scale={1.3} />
      <Tree position={[0, 0, -3.5]} scale={1.6} />
      {[-11, 11].map((x) => (
        <StreetLamp key={x} position={[x, 0, ROAD_Z - 1.9]} />
      ))}
    </>
  );
}

export default function FinaleScene() {
  return (
    <SceneCanvas camera={{ position: [0, 5.2, 18.5], fov: 30 }}>
      <FinaleWorld />
    </SceneCanvas>
  );
}
