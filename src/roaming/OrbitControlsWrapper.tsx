import React, { useEffect, useRef } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useStore } from '../state/useStore';
import * as THREE from 'three';

export const OrbitControlsWrapper: React.FC = () => {
  const cameraMode = useStore((s) => s.cameraMode);
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (cameraMode === 'orbit') {
      // Transition camera to dollhouse perspective
      camera.position.set(0, 24, 18);
      camera.lookAt(0, 0, 0);
      if (controlsRef.current) {
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
      }
    }
  }, [cameraMode, camera]);

  if (cameraMode !== 'orbit') return null;

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.06}
      maxPolarAngle={Math.PI / 2.05} // prevent going below ground
      minDistance={5}
      maxDistance={65}
      target={[0, 0, 0]}
    />
  );
};
