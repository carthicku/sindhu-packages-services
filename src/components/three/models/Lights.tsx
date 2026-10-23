import { useFrame } from '@react-three/fiber';
import { useRef, type MutableRefObject } from 'react';
import * as THREE from 'three';

type Props = {
  /** When provided, the sun and its shadow frustum follow this point each frame. */
  follow?: MutableRefObject<THREE.Vector3>;
  intensity?: number;
  warm?: boolean;
  shadowSize?: number;
};

const SUN_OFFSET = new THREE.Vector3(9, 15, 10);

export function Lights({ follow, intensity = 1.9, warm = false, shadowSize = 14 }: Props) {
  const sun = useRef<THREE.DirectionalLight>(null);

  useFrame(() => {
    if (!follow || !sun.current) return;
    sun.current.position.copy(follow.current).add(SUN_OFFSET);
    sun.current.target.position.copy(follow.current);
    sun.current.target.updateMatrixWorld();
  });

  return (
    <>
      <hemisphereLight args={[warm ? '#FFF1DF' : '#F4F7FC', '#C9BBA6', 1.05]} />
      <ambientLight intensity={0.25} />
      <directionalLight
        ref={sun}
        position={SUN_OFFSET.toArray()}
        intensity={intensity}
        color={warm ? '#FFD9AE' : '#FFF6EA'}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-shadowSize}
        shadow-camera-right={shadowSize}
        shadow-camera-top={shadowSize}
        shadow-camera-bottom={-shadowSize}
        shadow-camera-near={1}
        shadow-camera-far={60}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[-8, 6, -6]} intensity={0.35} color="#CFE0F5" />
    </>
  );
}
