import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../state/useStore';
import confetti from 'canvas-confetti';

export function useAutoWalkController() {
  const isAutoWalking = useStore((s) => s.isAutoWalking);
  const setIsAutoWalking = useStore((s) => s.setIsAutoWalking);
  const activePath = useStore((s) => s.activePath);
  const setUserPosition = useStore((s) => s.setUserPosition);
  const setUserRotation = useStore((s) => s.setUserRotation);
  const setCameraMode = useStore((s) => s.setCameraMode);

  const pathProgressRef = useRef<number>(0);
  const curveRef = useRef<THREE.CatmullRomCurve3 | null>(null);

  // When auto-walking starts, prepare curve and switch to FPS
  useEffect(() => {
    if (isAutoWalking && activePath.length >= 2) {
      setCameraMode('fps');
      const vectors = activePath.map((p) => new THREE.Vector3(p[0], 1.6, p[2]));
      curveRef.current = new THREE.CatmullRomCurve3(vectors, false, 'centripetal', 0.2);
      pathProgressRef.current = 0;
    } else {
      curveRef.current = null;
    }
  }, [isAutoWalking, activePath, setCameraMode]);

  useFrame((_, delta) => {
    if (!isAutoWalking || !curveRef.current) return;

    // Walking speed: ~2.5 m/s in auto-walk preview mode
    const totalLength = curveRef.current.getLength();
    if (totalLength <= 0.1) {
      setIsAutoWalking(false);
      return;
    }

    const step = (delta * 2.8) / totalLength;
    pathProgressRef.current += step;

    if (pathProgressRef.current >= 1.0) {
      // Reached destination!
      pathProgressRef.current = 1.0;
      const endPt = curveRef.current.getPointAt(1.0);
      setUserPosition([endPt.x, 1.6, endPt.z]);
      setIsAutoWalking(false);

      // Trigger celebratory confetti on arrival
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#06b6d4', '#6366f1', '#fbbf24']
        });
      } catch (e) {
        // ignore
      }
      return;
    }

    const point = curveRef.current.getPointAt(pathProgressRef.current);
    setUserPosition([point.x, 1.6, point.z]);

    // Calculate heading / look-ahead rotation
    const tangent = curveRef.current.getTangentAt(pathProgressRef.current);
    const yaw = Math.atan2(-tangent.x, -tangent.z);
    setUserRotation(yaw);
  });
}
