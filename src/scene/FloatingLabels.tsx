import React from 'react';
import { Html } from '@react-three/drei';
import { useStore } from '../state/useStore';
import floorPlanData from '../data/floorplan.json';

const floorPlan = floorPlanData;

export const FloatingLabels: React.FC = () => {
  const showLabels = useStore((s) => s.showLabels);
  const setSelectedObject = useStore((s) => s.setSelectedObject);
  const setDestination = useStore((s) => s.setDestination);
  const userPosition = useStore((s) => s.userPosition);
  const customPOIs = useStore((s) => s.customPOIs);

  if (!showLabels) return null;

  return (
    <group>
      {/* 1. Room Floating Labels */}
      {floorPlan.rooms.map((room) => {
        // Calculate distance from user to label to hide if too far (> 35m)
        const dist = Math.hypot(
          userPosition[0] - room.labelPosition[0],
          userPosition[2] - room.labelPosition[2]
        );
        if (dist > 35) return null;

        const isCorridor = room.id === 'corridor';
        if (isCorridor) return null; // keep corridor clean

        return (
          <group
            key={`label-${room.id}`}
            position={[room.labelPosition[0], room.labelPosition[1], room.labelPosition[2]]}
          >
            <Html
              center
              distanceFactor={18}
              className="pointer-events-auto cursor-pointer"
            >
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedObject({
                    id: room.id,
                    name: room.name,
                    room: room.name,
                    type: 'Room Zone',
                    position: [room.labelPosition[0], 0.5, room.labelPosition[2]],
                  });
                }}
                className="group flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/85 backdrop-blur-md border border-cyan-500/30 text-white text-[11px] font-medium shadow-lg hover:scale-110 hover:border-emerald-400 transition-all duration-200 select-none whitespace-nowrap"
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: room.color || '#06b6d4' }}
                />
                <span>{room.name.split('(')[0].trim()}</span>
              </div>
            </Html>
          </group>
        );
      })}

      {/* 2. Custom User-Dropped POI Labels */}
      {customPOIs.map((poi) => (
        <group key={`custom-label-${poi.id}`} position={poi.position}>
          <Html center distanceFactor={14}>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-400 text-emerald-200 text-[10px] font-bold shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {poi.name}
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
};
