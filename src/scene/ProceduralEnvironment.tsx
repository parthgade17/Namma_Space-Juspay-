import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useStore } from '../state/useStore';
import { RoomDefinition, Doorway } from '../types/floorplan';
import { InstancedFurniture } from './InstancedFurniture';
import floorPlanData from '../data/floorplan.json';

const floorPlan = floorPlanData;
const WALL_THICKNESS = 0.18;
const CEILING_HEIGHT = 3.4;

interface WallSegment {
  position: [number, number, number];
  size: [number, number, number];
}

export const ProceduralEnvironment: React.FC = () => {
  const showCeiling = useStore((s) => s.showCeiling);
  const showWireframe = useStore((s) => s.showWireframe);
  const showPointCloud = useStore((s) => s.showPointCloud);
  const setSelectedObject = useStore((s) => s.setSelectedObject);

  // 1. Procedural Wall Segments with Door Openings
  const { wallSegments, doorFrames } = useMemo(() => {
    const segments: WallSegment[] = [];
    const frames: { position: [number, number, number]; size: [number, number, number]; label?: string }[] = [];

    // Helper to generate a wall along an edge, splitting if there are doors
    const addWallWithDoors = (
      p1: [number, number], // [x, z]
      p2: [number, number],
      doors: Doorway[],
      isNorthSouth: boolean
    ) => {
      // Find doors on this wall segment
      const relevantDoors = doors.filter((d) => {
        if (isNorthSouth) {
          // Wall along Z
          const minZ = Math.min(p1[1], p2[1]);
          const maxZ = Math.max(p1[1], p2[1]);
          return Math.abs(d.position[0] - p1[0]) < 0.3 && d.position[2] >= minZ && d.position[2] <= maxZ;
        } else {
          // Wall along X
          const minX = Math.min(p1[0], p2[0]);
          const maxX = Math.max(p1[0], p2[0]);
          return Math.abs(d.position[2] - p1[1]) < 0.3 && d.position[0] >= minX && d.position[0] <= maxX;
        }
      });

      if (relevantDoors.length === 0) {
        // Solid wall
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

      // Wall with door openings: split into parts
      for (const door of relevantDoors) {
        const doorW = door.width;
        const doorH = door.height;

        if (!isNorthSouth) {
          // Horizontal wall (X axis)
          const minX = Math.min(p1[0], p2[0]);
          const maxX = Math.max(p1[0], p2[0]);
          const doorX = door.position[0];
          const z = p1[1];

          // Left segment
          const leftLen = doorX - doorW / 2 - minX;
          if (leftLen > 0.1) {
            segments.push({
              position: [minX + leftLen / 2, CEILING_HEIGHT / 2, z],
              size: [leftLen, CEILING_HEIGHT, WALL_THICKNESS],
            });
          }

          // Right segment
          const rightLen = maxX - (doorX + doorW / 2);
          if (rightLen > 0.1) {
            segments.push({
              position: [maxX - rightLen / 2, CEILING_HEIGHT / 2, z],
              size: [rightLen, CEILING_HEIGHT, WALL_THICKNESS],
            });
          }

          // Lintel segment above the door
          const lintelH = CEILING_HEIGHT - doorH;
          segments.push({
            position: [doorX, doorH + lintelH / 2, z],
            size: [doorW, lintelH, WALL_THICKNESS],
          });

          // Door frame decoration
          frames.push({
            position: [doorX, doorH / 2, z],
            size: [doorW, doorH, WALL_THICKNESS * 1.2],
            label: door.label,
          });
        } else {
          // Vertical wall (Z axis)
          const minZ = Math.min(p1[1], p2[1]);
          const maxZ = Math.max(p1[1], p2[1]);
          const doorZ = door.position[2];
          const x = p1[0];

          // Top segment
          const topLen = doorZ - doorW / 2 - minZ;
          if (topLen > 0.1) {
            segments.push({
              position: [x, CEILING_HEIGHT / 2, minZ + topLen / 2],
              size: [WALL_THICKNESS, CEILING_HEIGHT, topLen],
            });
          }

          // Bottom segment
          const btmLen = maxZ - (doorZ + doorW / 2);
          if (btmLen > 0.1) {
            segments.push({
              position: [x, CEILING_HEIGHT / 2, maxZ - btmLen / 2],
              size: [WALL_THICKNESS, CEILING_HEIGHT, btmLen],
            });
          }

          // Lintel segment above the door
          const lintelH = CEILING_HEIGHT - doorH;
          segments.push({
            position: [x, doorH + lintelH / 2, doorZ],
            size: [WALL_THICKNESS, lintelH, doorW],
          });

          // Door frame decoration
          frames.push({
            position: [x, doorH / 2, doorZ],
            size: [WALL_THICKNESS * 1.2, doorH, doorW],
            label: door.label,
          });
        }
      }
    };

    // Build walls for each room
    floorPlan.rooms.forEach((room) => {
      const b = room.bounds;
      const doors = room.doors as unknown as Doorway[];

      // North wall (Z = minZ)
      addWallWithDoors([b.minX, b.minZ], [b.maxX, b.minZ], doors, false);
      // South wall (Z = maxZ)
      addWallWithDoors([b.minX, b.maxZ], [b.maxX, b.maxZ], doors, false);
      // West wall (X = minX)
      addWallWithDoors([b.minX, b.minZ], [b.minX, b.maxZ], doors, true);
      // East wall (X = maxX)
      addWallWithDoors([b.maxX, b.minZ], [b.maxX, b.maxZ], doors, true);
    });

    return { wallSegments: segments, doorFrames: frames };
  }, []);

  // 2. Sampled Point Cloud geometry for simulated LiDAR/Scan view
  const pointCloudGeometry = useMemo(() => {
    const points: number[] = [];
    const step = 0.4;

    // Floor points
    for (let x = -21; x <= 21; x += step) {
      for (let z = -12; z <= 12; z += step) {
        points.push(x + (Math.random() - 0.5) * 0.05, 0.02, z + (Math.random() - 0.5) * 0.05);
      }
    }

    // Wall points
    wallSegments.forEach((seg) => {
      const [sx, sy, sz] = seg.size;
      const [px, py, pz] = seg.position;
      for (let y = 0.2; y <= sy; y += 0.5) {
        if (sx > sz) {
          for (let x = -sx / 2; x <= sx / 2; x += 0.5) {
            points.push(px + x, y, pz - sz / 2);
            points.push(px + x, y, pz + sz / 2);
          }
        } else {
          for (let z = -sz / 2; z <= sz / 2; z += 0.5) {
            points.push(px - sx / 2, y, pz + z);
            points.push(px + sx / 2, y, pz + z);
          }
        }
      }
    });

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    return geom;
  }, [wallSegments]);

  // Wall Material
  const wallMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#e2e8f0',
    roughness: 0.8,
    metalness: 0.05,
    wireframe: showWireframe,
  }), [showWireframe]);

  const frameMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#334155',
    roughness: 0.3,
    metalness: 0.8,
    wireframe: showWireframe,
  }), [showWireframe]);

  // Point Cloud render mode
  if (showPointCloud) {
    return (
      <group>
        <points geometry={pointCloudGeometry}>
          <pointsMaterial size={0.06} color="#06b6d4" transparent opacity={0.8} />
        </points>
      </group>
    );
  }

  return (
    <group>
      {/* 1. ROOM FLOORS */}
      {floorPlan.rooms.map((room) => {
        const b = room.bounds;
        const width = b.maxX - b.minX;
        const depth = b.maxZ - b.minZ;
        const centerX = (b.minX + b.maxX) / 2;
        const centerZ = (b.minZ + b.maxZ) / 2;

        let floorColor = '#f1f5f9';
        let roughness = 0.25;
        if (room.floorTexture === 'wood') {
          floorColor = '#b45309';
          roughness = 0.4;
        } else if (room.floorTexture === 'carpet') {
          floorColor = '#0f766e';
          roughness = 0.9;
        } else if (room.floorTexture === 'concrete') {
          floorColor = '#475569';
          roughness = 0.7;
        } else if (room.id === 'corridor') {
          floorColor = '#e2e8f0';
          roughness = 0.2;
        }

        return (
          <mesh
            key={`floor-${room.id}`}
            position={[centerX, 0, centerZ]}
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
            onClick={(e) => {
              e.stopPropagation();
              setSelectedObject({
                id: room.id,
                name: room.name,
                room: room.name,
                type: 'Room Zone',
                position: [centerX, 0.5, centerZ],
                meta: {
                  Dimensions: `${width.toFixed(1)}m × ${depth.toFixed(1)}m`,
                  Area: `${(width * depth).toFixed(0)} m²`,
                  Type: room.type.toUpperCase(),
                },
              });
            }}
          >
            <planeGeometry args={[width, depth]} />
            <meshStandardMaterial
              color={floorColor}
              roughness={roughness}
              metalness={0.08}
              wireframe={showWireframe}
            />
          </mesh>
        );
      })}

      {/* 2. PROCEDURAL WALLS */}
      {wallSegments.map((seg, idx) => (
        <mesh
          key={`wall-${idx}`}
          position={seg.position}
          castShadow
          receiveShadow
          material={wallMaterial}
        >
          <boxGeometry args={seg.size} />
        </mesh>
      ))}

      {/* 3. DOOR FRAMES & SIGN PLATES */}
      {doorFrames.map((frame, idx) => (
        <group key={`frame-${idx}`} position={frame.position}>
          {/* Frame border */}
          <mesh material={frameMaterial}>
            <boxGeometry args={[frame.size[0], frame.size[1], frame.size[2]]} />
          </mesh>
          {/* Room Plate sign over door */}
          <mesh position={[0, frame.size[1] / 2 + 0.18, 0]}>
            <boxGeometry args={[0.8, 0.22, 0.24]} />
            <meshStandardMaterial color="#0284c7" emissive="#0369a1" emissiveIntensity={0.4} />
          </mesh>
        </group>
      ))}

      {/* 4. TOGGLEABLE CEILING WITH EMBEDDED LIGHT FIXTURES */}
      {showCeiling && (
        <group position={[0, CEILING_HEIGHT, 0]}>
          {floorPlan.rooms.map((room) => {
            const b = room.bounds;
            const width = b.maxX - b.minX;
            const depth = b.maxZ - b.minZ;
            const centerX = (b.minX + b.maxX) / 2;
            const centerZ = (b.minZ + b.maxZ) / 2;

            return (
              <group key={`ceiling-${room.id}`}>
                {/* Ceiling Slab */}
                <mesh
                  position={[centerX, 0.05, centerZ]}
                  rotation={[Math.PI / 2, 0, 0]}
                  receiveShadow
                >
                  <planeGeometry args={[width, depth]} />
                  <meshStandardMaterial
                    color="#f8fafc"
                    roughness={0.9}
                    wireframe={showWireframe}
                    side={THREE.DoubleSide}
                  />
                </mesh>

                {/* Recessed Ceiling LED Panels */}
                <mesh position={[centerX, -0.01, centerZ]}>
                  <boxGeometry args={[Math.min(width * 0.5, 3), 0.04, Math.min(depth * 0.5, 3)]} />
                  <meshStandardMaterial
                    color="#ffffff"
                    emissive="#ffffff"
                    emissiveIntensity={1.0}
                  />
                </mesh>
              </group>
            );
          })}
        </group>
      )}

      {/* 5. INSTANCED FURNITURE (DESKS, PCS, CHAIRS, RACKS) */}
      <InstancedFurniture />
    </group>
  );
};
