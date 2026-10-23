import React, { useMemo } from 'react';
import { Html } from '@react-three/drei';
import { useStore } from '../state/useStore';
import { ALL_POIS } from '../data/poiDatabase';

export const FloatingLabels: React.FC = () => {
  const showLabels = useStore((s) => s.showLabels);
  const userPosition = useStore((s) => s.userPosition);
  const setSelectedObject = useStore((s) => s.setSelectedObject);
  const isAlignMode = useStore((s) => s.isAlignMode);
  const floorPlanTransform = useStore((s) => s.floorPlanTransform);

  // Filter labels: only visible between 2m and 10m, max 4 visible, never cover center
  const visibleLabels = useMemo(() => {
    if (!showLabels || isAlignMode) return [];

    const candidates: {
      id: string;
      name: string;
      position: [number, number, number];
      dist: number;
      type: string;
    }[] = [];

    ALL_POIS.forEach((poi) => {
      // Transform according to current alignment
      const px = poi.position[0] * floorPlanTransform.scale + floorPlanTransform.x;
      const pz = poi.position[2] * floorPlanTransform.scale + floorPlanTransform.z;
      const dist = Math.hypot(userPosition[0] - px, userPosition[2] - pz);

      // Only visible between 2.0m and 10.0m
      if (dist >= 2.0 && dist <= 10.0) {
        candidates.push({
          id: poi.id,
          name: poi.name,
          position: [px, 1.35, pz],
          dist,
          type: poi.category.toUpperCase(),
        });
      }
    });

    // Sort by distance and strictly cap at maximum 4 visible
    candidates.sort((a, b) => a.dist - b.dist);
    return candidates.slice(0, 4);
  }, [showLabels, isAlignMode, userPosition, floorPlanTransform]);

  if (!showLabels || isAlignMode) return null;

  return (
    <group>
      {visibleLabels.map((lbl) => {
        // Fade in from 2m to 3.5m, fade out from 7.5m to 10m
        let opacity = 1.0;
        if (lbl.dist < 3.5) {
          opacity = (lbl.dist - 2.0) / 1.5;
        } else if (lbl.dist > 7.5) {
          opacity = (10.0 - lbl.dist) / 2.5;
        }
        opacity = Math.max(0.1, Math.min(1.0, opacity));

        return (
          <group key={`label-${lbl.id}`} position={lbl.position}>
            <Html center distanceFactor={12} className="pointer-events-auto cursor-pointer">
              <div
                style={{ opacity }}
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
                className="px-2 py-0.5 rounded-full bg-[rgba(15,17,20,0.7)] backdrop-blur-md border border-white/10 text-slate-200 text-[11px] font-sans font-medium shadow-md hover:border-cyan-400 hover:text-white transition-all select-none whitespace-nowrap flex items-center gap-1.5"
              >
                {/* Small pin dot */}
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                <span className="leading-tight">{lbl.name}</span>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
};
