import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../state/useStore';
import confetti from 'canvas-confetti';

// Real-world human indoor walking pace: 1.3 meters / second (~4.7 km/h)
const REAL_HUMAN_WALKING_SPEED = 1.3;

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
  const currentYawRef = useRef<number>(0);

  useEffect(() => {
    if (isAutoWalking && activePath.length >= 2) {
      const eyeH = scanConfig.eyeHeight || 1.6;
      const vectors = activePath.map((p) => new THREE.Vector3(p[0], eyeH, p[2]));
      curveRef.current = new THREE.CatmullRomCurve3(vectors, false, 'centripetal', 0.25);
      pathProgressRef.current = 0;

      // Initial heading facing along the start of the path
      if (vectors.length >= 2) {
        const dx = vectors[1].x - vectors[0].x;
        const dz = vectors[1].z - vectors[0].z;
        currentYawRef.current = Math.atan2(-dx, -dz);
      }
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

    // Natural human acceleration (ease-in) and deceleration (ease-out)
    const distWalked = pathProgressRef.current * totalLength;
    const distRemaining = (1.0 - pathProgressRef.current) * totalLength;
    const accelFactor = Math.min(1.0, Math.max(0.35, distWalked / 0.8));
    const decelFactor = Math.min(1.0, Math.max(0.3, distRemaining / 0.8));
    const currentSpeed = REAL_HUMAN_WALKING_SPEED * Math.min(accelFactor, decelFactor);

    // Increment progress by exact human metric distance traveled in delta seconds
    const distanceStep = Math.min(delta, 0.05) * currentSpeed;
    const progressStep = distanceStep / totalLength;
    pathProgressRef.current += progressStep;

    const eyeH = scanConfig.eyeHeight || 1.6;

    // Check arrival
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

    const currentPt = curveRef.current.getPointAt(pathProgressRef.current);

    // Subtle natural human footstep bobbing (frequency: ~1.8 steps/sec, amplitude: 1.2 cm)
    const stepBobbing = Math.sin(pathProgressRef.current * totalLength * 4.2) * 0.012;
    setUserPosition([currentPt.x, eyeH + stepBobbing, currentPt.z]);

    // Smooth look-ahead heading interpolation (human head turns gently into upcoming corner)
    const lookAheadDistance = Math.min(1.0, pathProgressRef.current + Math.max(0.02, 1.2 / totalLength));
    const lookAheadPt = curveRef.current.getPointAt(lookAheadDistance);
    const targetYaw = Math.atan2(-(lookAheadPt.x - currentPt.x), -(lookAheadPt.z - currentPt.z));

    // Smooth shortest-angle rotation interpolation
    let diff = targetYaw - currentYawRef.current;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    currentYawRef.current += diff * Math.min(1.0, delta * 5.0);

    setUserRotation(currentYawRef.current);
  });
}
