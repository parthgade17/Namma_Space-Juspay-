import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useStore } from '../state/useStore';
import { defaultNavGrid } from '../navigation/navGrid';
import * as THREE from 'three';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

export const VirtualJoystick: React.FC = () => {
  const userPosition = useStore((s) => s.userPosition);
  const setUserPosition = useStore((s) => s.setUserPosition);
  const userRotation = useStore((s) => s.userRotation);
  const scanConfig = useStore((s) => s.scanConfig);
  const isAlignMode = useStore((s) => s.isAlignMode);
  const activePath = useStore((s) => s.activePath);
  const setIsUserWalking = useStore((s) => s.setIsUserWalking);

  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [knobOffset, setKnobOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isInteracting, setIsInteracting] = useState(false);

  const padRef = useRef<HTMLDivElement>(null);
  const activeTouchId = useRef<number | null>(null);
  const currentDeltaRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 1024;
    setIsTouchDevice(hasTouch);
  }, []);

  // Smooth movement and navigation driving loop
  useEffect(() => {
    if (isAlignMode) return;

    const interval = setInterval(() => {
      const { x: dx, y: dy } = currentDeltaRef.current;
      const dist = Math.hypot(dx, dy);

      if (dist < 3) {
        if (activePath.length >= 2) {
          setIsUserWalking(false);
        }
        return;
      }

      const maxRadius = 38;
      const normX = dx / maxRadius;
      const normY = -dy / maxRadius; // invert Y for screen coords

      // When actively following a navigation route, pushing forward drives the walking character along the path
      if (activePath.length >= 2) {
        if (normY > 0.2) {
          setIsUserWalking(true);
        } else {
          setIsUserWalking(false);
        }
        return;
      }

      const speed = (scanConfig.speed ?? 1.6) * 0.038;
      const moveX = (normX * Math.cos(userRotation) + normY * Math.sin(userRotation)) * speed;
      const moveZ = (-normX * Math.sin(userRotation) + normY * Math.cos(userRotation)) * speed;

      let nextX = userPosition[0] + moveX;
      let nextZ = userPosition[2] + moveZ;

      // Nav-layer wall collision
      if (!defaultNavGrid.isWalkableWorld(nextX, userPosition[2])) nextX = userPosition[0];
      if (!defaultNavGrid.isWalkableWorld(userPosition[0], nextZ)) nextZ = userPosition[2];
      if (!defaultNavGrid.isWalkableWorld(nextX, nextZ)) {
        nextX = userPosition[0];
        nextZ = userPosition[2];
      }

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
  }, [userPosition, userRotation, isAlignMode, activePath, scanConfig, setUserPosition, setIsUserWalking]);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (activeTouchId.current !== null || !padRef.current) return;
    const touch = e.changedTouches[0];
    activeTouchId.current = touch.identifier;
    setIsInteracting(true);
    updateKnob(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (activeTouchId.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === activeTouchId.current) {
        updateKnob(touch.clientX, touch.clientY);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === activeTouchId.current) {
        activeTouchId.current = null;
        setIsInteracting(false);
        setKnobOffset({ x: 0, y: 0 });
        currentDeltaRef.current = { x: 0, y: 0 };
        setIsUserWalking(false);
      }
    }
  };

  const updateKnob = useCallback((clientX: number, clientY: number) => {
    if (!padRef.current) return;
    const rect = padRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const rawDx = clientX - centerX;
    const rawDy = clientY - centerY;
    const dist = Math.hypot(rawDx, rawDy);
    const maxRadius = 38;

    const clampedX = dist > maxRadius ? (rawDx / dist) * maxRadius : rawDx;
    const clampedY = dist > maxRadius ? (rawDy / dist) * maxRadius : rawDy;

    setKnobOffset({ x: clampedX, y: clampedY });
    currentDeltaRef.current = { x: clampedX, y: clampedY };
  }, []);

  if (!isTouchDevice || isAlignMode) return null;

  return (
    <div
      ref={padRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className="fixed bottom-16 sm:bottom-20 left-4 z-40 w-28 h-28 rounded-full flex items-center justify-center touch-none select-none transition-opacity duration-300 pointer-events-auto opacity-85 hover:opacity-100"
    >
      {/* Outer Glow Ring & Base Pad */}
      <div className="absolute inset-0 rounded-full bg-[rgba(15,17,20,0.65)] backdrop-blur-md border border-cyan-500/30 shadow-2xl shadow-cyan-500/10 flex items-center justify-center">
        {/* Subtle Cardinal Direction Indicators */}
        <ChevronUp className="absolute top-1 w-3.5 h-3.5 text-cyan-400/50" />
        <ChevronDown className="absolute bottom-1 w-3.5 h-3.5 text-cyan-400/50" />
        <ChevronLeft className="absolute left-1 w-3.5 h-3.5 text-cyan-400/50" />
        <ChevronRight className="absolute right-1 w-3.5 h-3.5 text-cyan-400/50" />

        {/* Center Crosshair / Neutral Ring */}
        <div className="w-10 h-10 rounded-full border border-white/10" />
      </div>

      {/* Floating Thumb Stick Knob */}
      <div
        className={`w-12 h-12 rounded-full shadow-lg transition-transform ease-out ${
          isInteracting
            ? 'bg-gradient-to-tr from-cyan-500 to-cyan-300 shadow-cyan-400/50 border border-white/60 scale-105 duration-75'
            : 'bg-cyan-500/80 border border-white/30 duration-200'
        }`}
        style={{
          transform: `translate(${knobOffset.x}px, ${knobOffset.y}px)`,
        }}
      >
        {/* Knob Core Highlight */}
        <div className="w-full h-full rounded-full flex items-center justify-center">
          <div className="w-3.5 h-3.5 rounded-full bg-slate-950/40" />
        </div>
      </div>
    </div>
  );
};
