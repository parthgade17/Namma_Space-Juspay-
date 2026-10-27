import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useStore } from '../state/useStore';
import { ALL_POIS } from '../data/poiDatabase';

interface Props {
  sceneRef?: React.MutableRefObject<any>;
}

interface ProjectedLabel {
  id: string;
  name: string;
  room: string;
  type: string;
  screenX: number;
  screenY: number;
  opacity: number;
  position: [number, number, number];
}

const tempVec = new THREE.Vector3();

export const PooledLabelsOverlay: React.FC<Props> = ({ sceneRef }) => {
  const showLabels = useStore((s) => s.showLabels);
  const isAlignMode = useStore((s) => s.isAlignMode);
  const isTopDownView = useStore((s) => s.isTopDownView);
  const userPosition = useStore((s) => s.userPosition);
  const floorPlanTransform = useStore((s) => s.floorPlanTransform);
  const setSelectedObject = useStore((s) => s.setSelectedObject);

  const [activeLabels, setActiveLabels] = useState<ProjectedLabel[]>([]);
  const prevLabelsRef = useRef<string>('');

  useEffect(() => {
    if (!showLabels || isAlignMode || isTopDownView) {
      if (activeLabels.length > 0) setActiveLabels([]);
      prevLabelsRef.current = '';
      return;
    }

    // Run at a throttled 10 Hz (every 100ms) to prevent starving main thread
    const interval = setInterval(() => {
      const scene = sceneRef?.current;
      if (!scene) return;

      const camera = scene.children.find((c: any) => c.isCamera) || (scene as any).__r3f?.camera;
      if (!camera) return;

      const width = window.innerWidth;
      const height = window.innerHeight;
      const centerX = width / 2;
      const centerY = height / 2;

      // 1. Gather candidates between 2m and 10m
      const candidates: {
        poi: (typeof ALL_POIS)[0];
        dist: number;
        worldPos: [number, number, number];
      }[] = [];

      for (let i = 0; i < ALL_POIS.length; i++) {
        const poi = ALL_POIS[i];
        const px = poi.position[0] * floorPlanTransform.scale + floorPlanTransform.x;
        const pz = poi.position[2] * floorPlanTransform.scale + floorPlanTransform.z;
        const dist = Math.hypot(userPosition[0] - px, userPosition[2] - pz);

        if (dist >= 2.0 && dist <= 10.0) {
          candidates.push({
            poi,
            dist,
            worldPos: [px, 1.35, pz],
          });
        }
      }

      candidates.sort((a, b) => a.dist - b.dist);
      const visible: ProjectedLabel[] = [];

      for (let i = 0; i < candidates.length && visible.length < 4; i++) {
        const c = candidates[i];
        tempVec.set(c.worldPos[0], c.worldPos[1], c.worldPos[2]);
        tempVec.project(camera);

        if (tempVec.z > -1 && tempVec.z < 1) {
          const sx = (tempVec.x * 0.5 + 0.5) * width;
          const sy = (-tempVec.y * 0.5 + 0.5) * height;

          if (sx >= 40 && sx <= width - 40 && sy >= 60 && sy <= height - 60) {
            const distCenter = Math.hypot(sx - centerX, sy - centerY);
            if (distCenter > 55) {
              let opacity = 1.0;
              if (c.dist < 3.5) {
                opacity = (c.dist - 2.0) / 1.5;
              } else if (c.dist > 7.5) {
                opacity = (10.0 - c.dist) / 2.5;
              }
              opacity = Math.max(0.1, Math.min(1.0, opacity));

              visible.push({
                id: c.poi.id,
                name: c.poi.name,
                room: c.poi.name,
                type: c.poi.category.toUpperCase(),
                screenX: Math.round(sx),
                screenY: Math.round(sy),
                opacity: Math.round(opacity * 10) / 10,
                position: c.worldPos,
              });
            }
          }
        }
      }

      // Only trigger React state update if key positions or IDs changed
      const signature = visible.map((v) => `${v.id}:${Math.round(v.screenX / 4)}:${Math.round(v.screenY / 4)}`).join('|');
      if (signature !== prevLabelsRef.current) {
        prevLabelsRef.current = signature;
        setActiveLabels(visible);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [showLabels, isAlignMode, isTopDownView, userPosition, floorPlanTransform, sceneRef]);

  if (!showLabels || isAlignMode || isTopDownView || activeLabels.length === 0) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
      {activeLabels.map((lbl) => (
        <div
          key={lbl.id}
          style={{
            transform: `translate3d(${lbl.screenX}px, ${lbl.screenY}px, 0) translate(-50%, -50%)`,
            opacity: lbl.opacity,
          }}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedObject({
              id: lbl.id,
              name: lbl.name,
              room: lbl.name,
              type: lbl.type,
              position: lbl.position,
            });
          }}
          className="absolute pointer-events-auto cursor-pointer select-none group"
        >
          <div className="px-2.5 py-1 rounded-full bg-[rgba(15,17,20,0.75)] backdrop-blur-md border border-white/10 text-slate-200 text-[11px] font-sans font-medium shadow-md group-hover:border-cyan-400 group-hover:text-white group-hover:scale-105 transition-all flex items-center gap-1.5 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
            <span className="leading-tight">{lbl.name}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
