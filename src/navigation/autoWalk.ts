import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../state/useStore';
import confetti from 'canvas-confetti';

// Real-world human indoor walking pace: 1.45 meters / second (~5.2 km/h)
const REAL_HUMAN_WALKING_SPEED = 1.45;

export function useAutoWalkController() {
  const isAutoWalking = useStore((s) => s.isAutoWalking);
  const setIsAutoWalking = useStore((s) => s.setIsAutoWalking);
  const isUserWalking = useStore((s) => s.isUserWalking);
  const setIsUserWalking = useStore((s) => s.setIsUserWalking);
  const activePath = useStore((s) => s.activePath);
  const setUserPosition = useStore((s) => s.setUserPosition);
  const setUserRotation = useStore((s) => s.setUserRotation);
  const activeDestination = useStore((s) => s.activeDestination);
  const setArrivalToast = useStore((s) => s.setArrivalToast);
  const scanConfig = useStore((s) => s.scanConfig);

  const pathProgressRef = useRef<number>(0);
  const curveRef = useRef<THREE.CatmullRomCurve3 | null>(null);
  const currentYawRef = useRef<number>(0);

  // Initialize or reset curve whenever an active path is loaded
  useEffect(() => {
    if (activePath.length >= 2) {
      const eyeH = scanConfig.eyeHeight || 1.6;
      const vectors = activePath.map((p) => new THREE.Vector3(p[0], eyeH, p[2]));
      curveRef.current = new THREE.CatmullRomCurve3(vectors, false, 'centripetal', 0.25);
      pathProgressRef.current = 0;

      // Initial heading facing along the first segment of the path
      if (vectors.length >= 2) {
        const dx = vectors[1].x - vectors[0].x;
        const dz = vectors[1].z - vectors[0].z;
        const initialYaw = Math.atan2(-dx, -dz);
        currentYawRef.current = initialYaw;
        setUserRotation(initialYaw);
      }
    } else {
      curveRef.current = null;
      pathProgressRef.current = 0;
    }
  }, [activePath, scanConfig.eyeHeight, setUserRotation]);

  useFrame((_, delta) => {
    if (!curveRef.current) return;

    // The man only walks when the PERSON is actively walking (user input or simulation)
    const isActivelyWalking = isAutoWalking || isUserWalking;
    if (!isActivelyWalking) return;

    const totalLength = curveRef.current.getLength();
    if (totalLength <= 0.1) {
      setIsAutoWalking(false);
      setIsUserWalking(false);
      return;
    }

    // Natural human acceleration (ease-in) and deceleration (ease-out near destination)
    const distWalked = pathProgressRef.current * totalLength;
    const distRemaining = (1.0 - pathProgressRef.current) * totalLength;
    const accelFactor = Math.min(1.0, Math.max(0.7, distWalked / 0.4));
    const decelFactor = Math.min(1.0, Math.max(0.65, distRemaining / 0.5));
    const currentSpeed = REAL_HUMAN_WALKING_SPEED * Math.min(accelFactor, decelFactor);

    // Advance progress by metric distance traveled in delta seconds
    const distanceStep = Math.min(delta, 0.05) * currentSpeed;
    const progressStep = distanceStep / totalLength;
    pathProgressRef.current += progressStep;

    const eyeH = scanConfig.eyeHeight || 1.6;

    // Check arrival at destination
    if (pathProgressRef.current >= 1.0) {
      pathProgressRef.current = 1.0;
      const endPt = curveRef.current.getPointAt(1.0);
      setUserPosition([endPt.x, eyeH, endPt.z]);
      setIsAutoWalking(false);
      setIsUserWalking(false);

      try {
        confetti({
          particleCount: 65,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#22d3ee', '#06b6d4', '#38bdf8', '#10b981'],
        });
      } catch (e) {
        // ignore
      }

      const destTitle = activeDestination?.name || 'your destination';
      setArrivalToast(`You've arrived at ${destTitle}`);
      return;
    }

    // 1. Position along the path curve
    const currentPt = curveRef.current.getPointAt(pathProgressRef.current);

    // Subtle natural human footstep bobbing
    const stepBobbing = Math.sin(pathProgressRef.current * totalLength * 4.5) * 0.012;
    setUserPosition([currentPt.x, eyeH + stepBobbing, currentPt.z]);

    // 2. SMART TURN STEERING:
    // Where the turn arrives in the route, the 3D man smoothly takes the turn!
    const lookAheadDistance = Math.min(1.0, pathProgressRef.current + Math.max(0.02, 1.2 / totalLength));
    const lookAheadPt = curveRef.current.getPointAt(lookAheadDistance);
    const targetYaw = Math.atan2(-(lookAheadPt.x - currentPt.x), -(lookAheadPt.z - currentPt.z));

    // Smooth shortest-angle rotation interpolation so the character turns into each corner
    let diff = targetYaw - currentYawRef.current;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    currentYawRef.current += diff * Math.min(1.0, delta * 6.0);

    setUserRotation(currentYawRef.current);
  });
}
