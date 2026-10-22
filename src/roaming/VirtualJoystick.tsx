import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../state/useStore';
import { defaultNavGrid } from '../navigation/navGrid';
import * as THREE from 'three';

export const VirtualJoystick: React.FC = () => {
  const userPosition = useStore((s) => s.userPosition);
  const setUserPosition = useStore((s) => s.setUserPosition);
  const userRotation = useStore((s) => s.userRotation);
  const setUserRotation = useStore((s) => s.setUserRotation);
  const scanConfig = useStore((s) => s.scanConfig);
  const isAlignMode = useStore((s) => s.isAlignMode);

  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [joystickActive, setJoystickActive] = useState(false);
  const [joystickOrigin, setJoystickOrigin] = useState<{ x: number; y: number } | null>(null);
  const [joystickDelta, setJoystickDelta] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const lookTouchId = useRef<number | null>(null);
  const lastLookPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const moveTouchId = useRef<number | null>(null);
  const currentDeltaRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // Movement loop
  useEffect(() => {
    if (isAlignMode) return;

    const interval = setInterval(() => {
      const { x: dx, y: dy } = currentDeltaRef.current;
      if (Math.hypot(dx, dy) < 4) return;

      const normX = dx / 45;
      const normY = -dy / 45;

      const speed = (scanConfig.speed ?? 1.6) * 0.035;
      const moveX = (normX * Math.cos(userRotation) + normY * Math.sin(userRotation)) * speed;
      const moveZ = (-normX * Math.sin(userRotation) + normY * Math.cos(userRotation)) * speed;

      let nextX = userPosition[0] + moveX;
      let nextZ = userPosition[2] + moveZ;

      // Nav-layer wall collision
      if (!defaultNavGrid.isWalkableWorld(nextX, userPosition[2])) nextX = userPosition[0];
      if (!defaultNavGrid.isWalkableWorld(userPosition[0], nextZ)) nextZ = userPosition[2];

      // Bounds clamp
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

      setUserPosition([nextX, scanConfig.eyeHeight ?? 1.6, nextZ]);
    }, 25);

    return () => clearInterval(interval);
  }, [userPosition, userRotation, isAlignMode, scanConfig, setUserPosition]);

  if (!isTouchDevice || isAlignMode) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      // Left 45% of screen = Movement joystick
      if (touch.clientX < window.innerWidth * 0.45 && moveTouchId.current === null) {
        moveTouchId.current = touch.identifier;
        setJoystickOrigin({ x: touch.clientX, y: touch.clientY });
        setJoystickActive(true);
      }
      // Right 55% of screen = Look drag
      else if (touch.clientX >= window.innerWidth * 0.45 && lookTouchId.current === null) {
        lookTouchId.current = touch.identifier;
        lastLookPos.current = { x: touch.clientX, y: touch.clientY };
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === moveTouchId.current && joystickOrigin) {
        const rawDx = touch.clientX - joystickOrigin.x;
        const rawDy = touch.clientY - joystickOrigin.y;
        const dist = Math.hypot(rawDx, rawDy);
        const maxDist = 45;
        const clampedX = dist > maxDist ? (rawDx / dist) * maxDist : rawDx;
        const clampedY = dist > maxDist ? (rawDy / dist) * maxDist : rawDy;

        setJoystickDelta({ x: clampedX, y: clampedY });
        currentDeltaRef.current = { x: clampedX, y: clampedY };
      } else if (touch.identifier === lookTouchId.current) {
        const dx = touch.clientX - lastLookPos.current.x;
        lastLookPos.current = { x: touch.clientX, y: touch.clientY };
        setUserRotation(userRotation - dx * 0.005);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === moveTouchId.current) {
        moveTouchId.current = null;
        setJoystickActive(false);
        setJoystickDelta({ x: 0, y: 0 });
        currentDeltaRef.current = { x: 0, y: 0 };
      } else if (touch.identifier === lookTouchId.current) {
        lookTouchId.current = null;
      }
    }
  };

  return (
    <div
      className="absolute inset-0 z-20 pointer-events-auto touch-none select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {/* Visual Joystick Base & Puck */}
      {joystickActive && joystickOrigin && (
        <div
          className="fixed w-28 h-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/40 bg-black/40 backdrop-blur-sm pointer-events-none flex items-center justify-center"
          style={{ left: joystickOrigin.x, top: joystickOrigin.y }}
        >
          <div
            className="w-11 h-11 rounded-full bg-cyan-400/80 shadow-lg shadow-cyan-500/50"
            style={{
              transform: `translate(${joystickDelta.x}px, ${joystickDelta.y}px)`,
            }}
          />
        </div>
      )}

      {/* Guide on right */}
      <div className="absolute right-4 bottom-24 pointer-events-none text-slate-400 text-[10px] px-2.5 py-1 rounded-full bg-black/50 border border-white/5">
        Drag right half to look
      </div>
    </div>
  );
};
