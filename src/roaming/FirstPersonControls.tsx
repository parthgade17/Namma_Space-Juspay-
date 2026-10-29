import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../state/useStore';
import { defaultNavGrid } from '../navigation/navGrid';
import { findPath } from '../navigation/astar';
import { generateTurnDirections } from '../navigation/turnByTurn';

export const FirstPersonControls: React.FC = () => {
  const { camera, gl } = useThree();
  const userPosition = useStore((s) => s.userPosition);
  const setUserPosition = useStore((s) => s.setUserPosition);
  const userRotation = useStore((s) => s.userRotation);
  const setUserRotation = useStore((s) => s.setUserRotation);
  const cameraPerspective = useStore((s) => s.cameraPerspective);
  const isAutoWalking = useStore((s) => s.isAutoWalking);
  const isUserWalking = useStore((s) => s.isUserWalking);
  const setIsUserWalking = useStore((s) => s.setIsUserWalking);
  const activePath = useStore((s) => s.activePath);
  const activeDestination = useStore((s) => s.activeDestination);
  const setNavigationRoute = useStore((s) => s.setNavigationRoute);
  const scanConfig = useStore((s) => s.scanConfig);
  const isAlignMode = useStore((s) => s.isAlignMode);
  const toggleCalibration = useStore((s) => s.toggleCalibration);

  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const isLockedRef = useRef(false);

  // Target and current yaw/pitch for smooth damped mouse look
  const currentEuler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const targetEuler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));

  // Velocity vector for smooth acceleration / deceleration
  const velocity = useRef(new THREE.Vector3());

  // Reset camera to initial config position
  const resetCamera = () => {
    const startX = scanConfig.start?.[0] ?? 0;
    const startZ = scanConfig.start?.[1] ?? 0;
    const eyeH = scanConfig.eyeHeight ?? 1.6;
    const yaw = THREE.MathUtils.degToRad(scanConfig.startYaw ?? 0);

    camera.position.set(startX, eyeH, startZ);
    targetEuler.current.set(0, yaw, 0, 'YXZ');
    currentEuler.current.set(0, yaw, 0, 'YXZ');
    camera.quaternion.setFromEuler(currentEuler.current);
    setUserPosition([startX, eyeH, startZ]);
    setUserRotation(yaw);
  };

  useEffect(() => {
    resetCamera();
  }, [scanConfig.start, scanConfig.eyeHeight, scanConfig.startYaw]);

  // Pointer Lock and Key listeners
  useEffect(() => {
    if (isAlignMode) return;

    const onPointerDown = (e: MouseEvent) => {
      if (e.button === 0 && !isLockedRef.current && !isAutoWalking) {
        gl.domElement.requestPointerLock?.();
      }
    };

    const onPointerLockChange = () => {
      isLockedRef.current = document.pointerLockElement === gl.domElement;
    };

    const onMouseMove = (event: MouseEvent) => {
      if (!isLockedRef.current || isAutoWalking) return;

      const movementX = event.movementX || 0;
      const movementY = event.movementY || 0;

      targetEuler.current.y -= movementX * 0.0022;
      targetEuler.current.x -= movementY * 0.0022;

      // Clamp pitch between -85 and +85 degrees
      targetEuler.current.x = THREE.MathUtils.clamp(
        targetEuler.current.x,
        -Math.PI / 2.1,
        Math.PI / 2.1
      );
    };

    // Touch look tracking for mobile
    let touchLookId: number | null = null;
    let lastTouchX = 0;
    let lastTouchY = 0;

    const onTouchStart = (e: TouchEvent) => {
      if (isAutoWalking) return;
      if (touchLookId === null && e.changedTouches.length > 0) {
        const touch = e.changedTouches[0];
        touchLookId = touch.identifier;
        lastTouchX = touch.clientX;
        lastTouchY = touch.clientY;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isAutoWalking || touchLookId === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === touchLookId) {
          const dx = touch.clientX - lastTouchX;
          const dy = touch.clientY - lastTouchY;
          lastTouchX = touch.clientX;
          lastTouchY = touch.clientY;

          targetEuler.current.y -= dx * 0.0032;
          targetEuler.current.x -= dy * 0.0032;
          targetEuler.current.x = THREE.MathUtils.clamp(
            targetEuler.current.x,
            -Math.PI / 2.1,
            Math.PI / 2.1
          );
        }
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchLookId) {
          touchLookId = null;
        }
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true;
      if (e.code === 'KeyW' || e.code === 'ArrowUp') {
        if (activePath.length >= 2) {
          setIsUserWalking(true);
        }
      }
      if (e.code === 'KeyT' && !e.repeat) {
        toggleCalibration();
      }
      if (e.code === 'KeyR' && !e.repeat) {
        resetCamera();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
      if (e.code === 'KeyW' || e.code === 'ArrowUp') {
        setIsUserWalking(false);
      }
    };

    const dom = gl.domElement;
    dom.addEventListener('click', onPointerDown);
    dom.addEventListener('touchstart', onTouchStart, { passive: true });
    dom.addEventListener('touchmove', onTouchMove, { passive: true });
    dom.addEventListener('touchend', onTouchEnd, { passive: true });
    dom.addEventListener('touchcancel', onTouchEnd, { passive: true });
    document.addEventListener('pointerlockchange', onPointerLockChange);
    document.addEventListener('mousemove', onMouseMove);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      dom.removeEventListener('click', onPointerDown);
      dom.removeEventListener('touchstart', onTouchStart);
      dom.removeEventListener('touchmove', onTouchMove);
      dom.removeEventListener('touchend', onTouchEnd);
      dom.removeEventListener('touchcancel', onTouchEnd);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      document.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      if (document.pointerLockElement === dom) {
        document.exitPointerLock?.();
      }
    };
  }, [isAlignMode, isAutoWalking, gl, toggleCalibration]);

  // Off-path dynamic re-routing check
  const lastRerouteTime = useRef(0);
  const checkOffPath = (curX: number, curZ: number) => {
    if (activePath.length < 2 || !activeDestination || isAutoWalking) return;
    const now = Date.now();
    if (now - lastRerouteTime.current < 2000) return;

    let minDist = Infinity;
    for (const pt of activePath) {
      const d = Math.hypot(curX - pt[0], curZ - pt[2]);
      if (d < minDist) minDist = d;
    }

    if (minDist > 1.8) {
      lastRerouteTime.current = now;
      const newPath = findPath(
        curX,
        curZ,
        activeDestination.position[0],
        activeDestination.position[2]
      );
      if (newPath.length >= 2) {
        const { directions, totalDistance } = generateTurnDirections(
          newPath,
          activeDestination
        );
        setNavigationRoute(newPath, directions, totalDistance);
      }
    }
  };

  useFrame((_, delta) => {
    if (isAlignMode) return;

    // Apply slight mouse/touch look damping
    const damp = Math.min(1.0, delta * 24);
    currentEuler.current.x += (targetEuler.current.x - currentEuler.current.x) * damp;
    currentEuler.current.y += (targetEuler.current.y - currentEuler.current.y) * damp;
    if (!isAutoWalking) {
      setUserRotation(currentEuler.current.y);
    }

    const updateCamera = (posX: number, posZ: number) => {
      if (cameraPerspective === 'follow') {
        const yaw = isAutoWalking ? userRotation : currentEuler.current.y;
        const followDist = 1.75;
        const camX = posX + Math.sin(yaw) * followDist;
        const camZ = posZ + Math.cos(yaw) * followDist;
        const camY = (scanConfig.eyeHeight ?? 1.6) + 0.35;
        camera.position.set(camX, camY, camZ);

        // Look at chest/path ahead of the avatar
        const lookAhead = 0.5;
        const lookX = posX - Math.sin(yaw) * lookAhead;
        const lookZ = posZ - Math.cos(yaw) * lookAhead;
        const lookY = 1.05;
        camera.lookAt(lookX, lookY, lookZ);
      } else {
        const eyeH = scanConfig.eyeHeight ?? 1.6;
        camera.position.set(posX, eyeH, posZ);
        if (isAutoWalking) {
          currentEuler.current.set(0, userRotation, 0, 'YXZ');
          targetEuler.current.set(0, userRotation, 0, 'YXZ');
        }
        camera.quaternion.setFromEuler(currentEuler.current);
      }
    };

    // In route navigation mode, path progress and turn steering are managed along the route
    if (activePath.length >= 2) {
      updateCamera(userPosition[0], userPosition[2]);
      return;
    }

    // WASD movement inputs
    let moveForward = 0;
    let moveRight = 0;

    const keys = keysPressed.current;
    if (keys['KeyW'] || keys['ArrowUp']) moveForward += 1;
    if (keys['KeyS'] || keys['ArrowDown']) moveForward -= 1;
    if (keys['KeyA'] || keys['ArrowLeft']) moveRight -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) moveRight += 1;

    // Target velocity relative to camera yaw
    const forward = new THREE.Vector3(0, 0, -1)
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), currentEuler.current.y);
    const right = new THREE.Vector3(1, 0, 0)
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), currentEuler.current.y);

    const inputDir = new THREE.Vector3()
      .addScaledVector(forward, moveForward)
      .addScaledVector(right, moveRight)
      .normalize();

    const maxSpeed = (scanConfig.speed ?? 1.6) * (keys['ShiftLeft'] || keys['ShiftRight'] ? 2.2 : 1.0);
    const targetVel = inputDir.multiplyScalar(maxSpeed);

    // Smooth acceleration / deceleration
    const accelRate = Math.min(1.0, delta * 12);
    velocity.current.lerp(targetVel, accelRate);

    if (velocity.current.lengthSq() < 0.0001) {
      updateCamera(userPosition[0], userPosition[2]);
      return;
    }

    const moveStep = velocity.current.clone().multiplyScalar(delta);

    let nextX = userPosition[0] + moveStep.x;
    let nextZ = userPosition[2] + moveStep.z;

    // Nav-layer Wall Collision Check (prevent passing through walls)
    if (!defaultNavGrid.isWalkableWorld(nextX, userPosition[2])) {
      nextX = userPosition[0];
    }
    if (!defaultNavGrid.isWalkableWorld(userPosition[0], nextZ)) {
      nextZ = userPosition[2];
    }
    if (!defaultNavGrid.isWalkableWorld(nextX, nextZ)) {
      nextX = userPosition[0];
      nextZ = userPosition[2];
    }

    // Bounds clamp from scanConfig
    const b = scanConfig.bounds;
    if (b) {
      nextX = THREE.MathUtils.clamp(
        nextX,
        Math.min(b.minX, b.maxX),
        Math.max(b.minX, b.maxX)
      );
      nextZ = THREE.MathUtils.clamp(
        nextZ,
        Math.min(b.minZ, b.maxZ),
        Math.max(b.minZ, b.maxZ)
      );
    }

    const eyeH = scanConfig.eyeHeight ?? 1.6;
    setUserPosition([nextX, eyeH, nextZ]);
    updateCamera(nextX, nextZ);

    checkOffPath(nextX, nextZ);
  });

  return null;
};
