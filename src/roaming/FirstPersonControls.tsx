import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../state/useStore';
import { defaultNavGrid } from '../navigation/navGrid';
import { findPath } from '../navigation/astar';
import { generateTurnDirections } from '../navigation/turnByTurn';

export const FirstPersonControls: React.FC = () => {
  const { camera, gl } = useThree();
  const cameraMode = useStore((s) => s.cameraMode);
  const userPosition = useStore((s) => s.userPosition);
  const setUserPosition = useStore((s) => s.setUserPosition);
  const setUserRotation = useStore((s) => s.setUserRotation);
  const collisionEnabled = useStore((s) => s.collisionEnabled);
  const isAutoWalking = useStore((s) => s.isAutoWalking);
  const activePath = useStore((s) => s.activePath);
  const activeDestination = useStore((s) => s.activeDestination);
  const setNavigationRoute = useStore((s) => s.setNavigationRoute);

  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const isLockedRef = useRef(false);
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));

  // Pointer Lock setup
  useEffect(() => {
    if (cameraMode !== 'fps') return;

    const onPointerDown = () => {
      if (!isLockedRef.current && !isAutoWalking) {
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

      euler.current.setFromQuaternion(camera.quaternion);
      euler.current.y -= movementX * 0.0022;
      euler.current.x -= movementY * 0.0022;

      // Clamp vertical look angle
      euler.current.x = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, euler.current.x));
      camera.quaternion.setFromEuler(euler.current);

      setUserRotation(euler.current.y);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true;
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
    };

    const dom = gl.domElement;
    dom.addEventListener('click', onPointerDown);
    document.addEventListener('pointerlockchange', onPointerLockChange);
    document.addEventListener('mousemove', onMouseMove);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      dom.removeEventListener('click', onPointerDown);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      document.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      if (document.pointerLockElement === dom) {
        document.exitPointerLock?.();
      }
    };
  }, [cameraMode, isAutoWalking, camera, gl, setUserRotation]);

  // Recalculate route if user goes off-path by > 1.8 meters
  const lastRerouteTime = useRef(0);
  const checkOffPath = (curX: number, curZ: number) => {
    if (activePath.length < 2 || !activeDestination || isAutoWalking) return;
    const now = Date.now();
    if (now - lastRerouteTime.current < 2000) return; // Debounce 2s

    // Find distance to closest path segment
    let minDist = Infinity;
    for (const pt of activePath) {
      const d = Math.hypot(curX - pt[0], curZ - pt[2]);
      if (d < minDist) minDist = d;
    }

    if (minDist > 1.8) {
      lastRerouteTime.current = now;
      const newPath = findPath(curX, curZ, activeDestination.position[0], activeDestination.position[2]);
      if (newPath.length >= 2) {
        const { directions, totalDistance } = generateTurnDirections(newPath, activeDestination);
        setNavigationRoute(newPath, directions, totalDistance);
      }
    }
  };

  useFrame((_, delta) => {
    if (cameraMode !== 'fps') return;

    // In auto-walk, position is driven by useAutoWalkController
    if (isAutoWalking) {
      camera.position.set(userPosition[0], 1.6, userPosition[2]);
      return;
    }

    // WASD movement
    let moveForward = 0;
    let moveRight = 0;

    const keys = keysPressed.current;
    if (keys['KeyW'] || keys['ArrowUp']) moveForward += 1;
    if (keys['KeyS'] || keys['ArrowDown']) moveForward -= 1;
    if (keys['KeyA'] || keys['ArrowLeft']) moveRight -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) moveRight += 1;

    if (moveForward === 0 && moveRight === 0) {
      camera.position.set(userPosition[0], 1.6, userPosition[2]);
      return;
    }

    // Speed: 3.5 m/s normal, 5.5 m/s with Shift
    const speed = (keys['ShiftLeft'] || keys['ShiftRight'] ? 5.5 : 3.5) * delta;

    // Movement relative to camera yaw
    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), euler.current.y);
    const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), euler.current.y);

    const moveVector = new THREE.Vector3()
      .addScaledVector(forward, moveForward)
      .addScaledVector(right, moveRight)
      .normalize()
      .multiplyScalar(speed);

    let nextX = userPosition[0] + moveVector.x;
    let nextZ = userPosition[2] + moveVector.z;

    // Collision detection against walls and furniture
    if (collisionEnabled) {
      // Test X movement separately for smooth wall sliding
      if (!defaultNavGrid.isWalkableWorld(nextX, userPosition[2])) {
        nextX = userPosition[0];
      }
      // Test Z movement
      if (!defaultNavGrid.isWalkableWorld(userPosition[0], nextZ)) {
        nextZ = userPosition[2];
      }
      // Diagonal corner check
      if (!defaultNavGrid.isWalkableWorld(nextX, nextZ)) {
        nextX = userPosition[0];
        nextZ = userPosition[2];
      }
    }

    setUserPosition([nextX, 1.6, nextZ]);
    camera.position.set(nextX, 1.6, nextZ);

    checkOffPath(nextX, nextZ);
  });

  return null;
};
