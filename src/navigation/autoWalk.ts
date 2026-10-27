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
  const activeDestination = useStore((s) => s.activeDestination);
  const setArrivalToast = useStore((s) => s.setArrivalToast);
  const scanConfig = useStore((s) => s.scanConfig);

  const pathProgressRef = useRef<number>(0);
  const curveRef = useRef<THREE.CatmullRomCurve3 | null>(null);

  useEffect(() => {
    if (isAutoWalking && activePath.length >= 2) {
      const eyeH = scanConfig.eyeHeight || 1.6;
      const vectors = activePath.map((p) => new THREE.Vector3(p[0], eyeH, p[2]));
      curveRef.current = new THREE.CatmullRomCurve3(vectors, false, 'centripetal', 0.2);
      pathProgressRef.current = 0;
    } else {
      curveRef.current = null;
    }
  }, [isAutoWalking, activePath, scanConfig.eyeHeight]);

  useFrame((_, delta) => {
    if (!isAutoWalking || !curveRef.current) return;

    const totalLength = curveRef.current.getLength();
    if (totalLength <= 0.1) {
      setIsAutoWalking(false);
      return;
    }

    const step = (delta * 2.2) / totalLength;
    pathProgressRef.current += step;

    const eyeH = scanConfig.eyeHeight || 1.6;

    if (pathProgressRef.current >= 1.0) {
      pathProgressRef.current = 1.0;
      const endPt = curveRef.current.getPointAt(1.0);
      setUserPosition([endPt.x, eyeH, endPt.z]);
      setIsAutoWalking(false);

      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#22d3ee', '#06b6d4', '#38bdf8'],
        });
      } catch (e) {
        // ignore
      }

      const destTitle = activeDestination?.name || 'your destination';
      setArrivalToast(`You've arrived at ${destTitle}`);
      return;
    }

    const point = curveRef.current.getPointAt(pathProgressRef.current);
    setUserPosition([point.x, eyeH, point.z]);

    const tangent = curveRef.current.getTangentAt(pathProgressRef.current);
    const yaw = Math.atan2(-tangent.x, -tangent.z);
    setUserRotation(yaw);
  });
}
