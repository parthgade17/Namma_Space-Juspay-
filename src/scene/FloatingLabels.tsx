import React, { useMemo } from 'react';
import { Html } from '@react-three/drei';
import { useStore } from '../state/useStore';
import floorPlanData from '../data/floorplan.json';

export const FloatingLabels: React.FC = () => {
  const showLabels = useStore((s) => s.showLabels);
  const userPosition = useStore((s) => s.userPosition);
  const setSelectedObject = useStore((s) => s.setSelectedObject);
  const floorPlanTransform = useStore((s) => s.floorPlanTransform);
  const isAlignMode = useStore((s) => s.isAlignMode);

  // Collect and sort all candidate labels by distance from user, keeping max 6 visible
  const visibleLabels = useMemo(() => {
    if (!showLabels || isAlignMode) return [];

    const candidates: {
      id: string;
      name: string;
      position: [number, number, number];
      dist: number;
      type: string;
    }[] = [];

    // Rooms
    floorPlanData.rooms.forEach((room) => {
      if (room.id === 'corridor') return;
      const lx = room.labelPosition[0] * floorPlanTransform.scale + floorPlanTransform.x;
      const lz = room.labelPosition[2] * floorPlanTransform.scale + floorPlanTransform.z;
      const dist = Math.hypot(userPosition[0] - lx, userPosition[2] - lz);

      if (dist < 22) {
        candidates.push({
          id: room.id,
          name: room.name.split('(')[0].trim(),
          position: [lx, 1.3, lz],
          dist,
          type: 'Room',
        });
      }
    });

    // Key Exits / POIs
    floorPlanData.exits.forEach((exit) => {
      const ex = exit.position[0] * floorPlanTransform.scale + floorPlanTransform.x;
      const ez = exit.position[2] * floorPlanTransform.scale + floorPlanTransform.z;
      const dist = Math.hypot(userPosition[0] - ex, userPosition[2] - ez);

      if (dist < 22) {
        candidates.push({
          id: exit.id,
          name: exit.name,
          position: [ex, 1.3, ez],
          dist,
          type: 'Exit',
        });
      }
    });

    // Sort by distance and cap at max 6 visible
    candidates.sort((a, b) => a.dist - b.dist);
    return candidates.slice(0, 6);
  }, [showLabels, isAlignMode, userPosition, floorPlanTransform]);

  if (!showLabels || isAlignMode) return null;

  return (
    <group>
      {visibleLabels.map((lbl) => {
        // Opacity drops smoothly from 1.0 down to 0.1 at 20m
        const opacity = Math.max(0.15, Math.min(1.0, 1 - (lbl.dist - 4) / 16));

        return (
          <group key={`label-${lbl.id}`} position={lbl.position}>
            <Html center distanceFactor={14} className="pointer-events-auto cursor-pointer">
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
                className="px-2.5 py-1 rounded-full bg-[rgba(15,17,20,0.65)] backdrop-blur-md border border-white/10 text-slate-200 text-[12px] font-sans font-medium shadow-md hover:border-cyan-400 hover:text-white transition-all select-none whitespace-nowrap flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>{lbl.name}</span>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
};
