import React, { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useStore } from '../state/useStore';

export const AlignModeControls: React.FC = () => {
  const isAlignMode = useStore((s) => s.isAlignMode);
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (isAlignMode) {
      // Switch camera to top-down view directly above the splat
      camera.position.set(0, 25, 0.01);
      camera.lookAt(0, 0, 0);
      if (controlsRef.current) {
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
      }
    }
  }, [isAlignMode, camera]);

  if (!isAlignMode) return null;

  return (
    <OrbitControls
      ref={controlsRef}
      enableRotate={false} // Orthographic top-down pan and zoom
      enablePan={true}
      enableZoom={true}
      target={[0, 0, 0]}
    />
  );
};
