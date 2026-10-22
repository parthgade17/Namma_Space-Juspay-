import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useStore } from '../state/useStore';
import { Doorway } from '../types/floorplan';
import floorPlanData from '../data/floorplan.json';

const WALL_THICKNESS = 0.18;
const CEILING_HEIGHT = 3.0;

interface WallSegment {
  position: [number, number, number];
  size: [number, number, number];
}

export const ProceduralEnvironment: React.FC = () => {
  const showNavLayer = useStore((s) => s.showNavLayer);
  const floorPlanTransform = useStore((s) => s.floorPlanTransform);
  const dynamicFloorPlan = useStore((s) => s.dynamicFloorPlan || floorPlanData);

  // 1. Procedural Wall Segments with Door Openings
  const wallSegments = useMemo(() => {
    const segments: WallSegment[] = [];

    const addWallWithDoors = (
      p1: [number, number],
      p2: [number, number],
      doors: Doorway[],
      isNorthSouth: boolean
    ) => {
      const relevantDoors = doors.filter((d) => {
        if (isNorthSouth) {
          const minZ = Math.min(p1[1], p2[1]);
          const maxZ = Math.max(p1[1], p2[1]);
          return Math.abs(d.position[0] - p1[0]) < 0.3 && d.position[2] >= minZ && d.position[2] <= maxZ;
        } else {
          const minX = Math.min(p1[0], p2[0]);
          const maxX = Math.max(p1[0], p2[0]);
          return Math.abs(d.position[2] - p1[1]) < 0.3 && d.position[0] >= minX && d.position[0] <= maxX;
        }
      });

      if (relevantDoors.length === 0) {
        const len = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
        const midX = (p1[0] + p2[0]) / 2;
        const midZ = (p1[1] + p2[1]) / 2;
        segments.push({
          position: [midX, CEILING_HEIGHT / 2, midZ],
          size: isNorthSouth
            ? [WALL_THICKNESS, CEILING_HEIGHT, len]
            : [len, CEILING_HEIGHT, WALL_THICKNESS],
        });
        return;
      }

      for (const door of relevantDoors) {
        const doorW = door.width;
        const doorH = door.height;

        if (!isNorthSouth) {
          const minX = Math.min(p1[0], p2[0]);
          const maxX = Math.max(p1[0], p2[0]);
          const doorX = door.position[0];
          const z = p1[1];

          const leftLen = doorX - doorW / 2 - minX;
          if (leftLen > 0.1) {
            segments.push({
              position: [minX + leftLen / 2, CEILING_HEIGHT / 2, z],
              size: [leftLen, CEILING_HEIGHT, WALL_THICKNESS],
            });
          }

          const rightLen = maxX - (doorX + doorW / 2);
          if (rightLen > 0.1) {
            segments.push({
              position: [maxX - rightLen / 2, CEILING_HEIGHT / 2, z],
              size: [rightLen, CEILING_HEIGHT, WALL_THICKNESS],
            });
          }

          const lintelH = CEILING_HEIGHT - doorH;
          segments.push({
            position: [doorX, doorH + lintelH / 2, z],
            size: [doorW, lintelH, WALL_THICKNESS],
          });
        } else {
          const minZ = Math.min(p1[1], p2[1]);
          const maxZ = Math.max(p1[1], p2[1]);
          const doorZ = door.position[2];
          const x = p1[0];

          const topLen = doorZ - doorW / 2 - minZ;
          if (topLen > 0.1) {
            segments.push({
              position: [x, CEILING_HEIGHT / 2, minZ + topLen / 2],
              size: [WALL_THICKNESS, CEILING_HEIGHT, topLen],
            });
          }

          const btmLen = maxZ - (doorZ + doorW / 2);
          if (btmLen > 0.1) {
            segments.push({
              position: [x, CEILING_HEIGHT / 2, maxZ - btmLen / 2],
              size: [WALL_THICKNESS, CEILING_HEIGHT, btmLen],
            });
          }

          const lintelH = CEILING_HEIGHT - doorH;
          segments.push({
            position: [x, doorH + lintelH / 2, doorZ],
            size: [WALL_THICKNESS, lintelH, doorW],
          });
        }
      }
    };

    dynamicFloorPlan.rooms.forEach((room: any) => {
      const b = room.bounds;
      const doors = (room.doors || []) as Doorway[];

      addWallWithDoors([b.minX, b.minZ], [b.maxX, b.minZ], doors, false);
      addWallWithDoors([b.minX, b.maxZ], [b.maxX, b.maxZ], doors, false);
      addWallWithDoors([b.minX, b.minZ], [b.minX, b.maxZ], doors, true);
      addWallWithDoors([b.maxX, b.minZ], [b.maxX, b.maxZ], doors, true);
    });

    return segments;
  }, [dynamicFloorPlan]);

  // Faint 20% white wireframe material for navigation proxy
  const navWireframeMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#ffffff',
        wireframe: true,
        transparent: true,
        opacity: 0.2,
      }),
    []
  );

  // By default, the procedural geometry is INVISIBLE
  if (!showNavLayer) return null;

  return (
    <group
      position={[floorPlanTransform.x, 0, floorPlanTransform.z]}
      rotation={[0, floorPlanTransform.rotation, 0]}
      scale={floorPlanTransform.scale}
    >
      {/* 1. FAINT WIREFRAME WALLS (NAVIGATION PROXY) */}
      {wallSegments.map((seg, idx) => (
        <mesh
          key={`nav-wall-${idx}`}
          position={seg.position}
          material={navWireframeMaterial}
        >
          <boxGeometry args={seg.size} />
        </mesh>
      ))}

      {/* 2. FAINT WIREFRAME ROOM BOUNDARIES ON FLOOR (NO COLOURED FILLS) */}
      {dynamicFloorPlan.rooms.map((room: any) => {
        const b = room.bounds;
        const width = b.maxX - b.minX;
        const depth = b.maxZ - b.minZ;
        const centerX = (b.minX + b.maxX) / 2;
        const centerZ = (b.minZ + b.maxZ) / 2;

        return (
          <group key={`nav-room-${room.id}`} position={[centerX, 0.02, centerZ]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} material={navWireframeMaterial}>
              <planeGeometry args={[width, depth]} />
            </mesh>
          </group>
        );
      })}

      {/* 3. FAINT WIREFRAME DESK BOUNDARIES */}
      {dynamicFloorPlan.rooms.flatMap((room: any) =>
        (room.furniture || []).map((item: any) => {
          if (item.type !== 'desk_pc' && item.type !== 'teacher_desk' && item.type !== 'cubicle')
            return null;
          return (
            <mesh
              key={`nav-furn-${item.id}`}
              position={[item.position[0], 0.35, item.position[2]]}
              rotation={item.rotation || [0, 0, 0]}
              material={navWireframeMaterial}
            >
              <boxGeometry args={[1.4, 0.7, 0.8]} />
            </mesh>
          );
        })
      )}
    </group>
  );
};
