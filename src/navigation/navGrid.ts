import { FloorPlanData, RoomDefinition } from '../types/floorplan';
import floorPlanData from '../data/floorplan.json';

const floorPlan = floorPlanData as unknown as FloorPlanData;

export interface NavGrid {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  resolution: number;
  cols: number;
  rows: number;
  walkable: boolean[][]; // [row][col] -> true if walkable
  worldToGrid: (x: number, z: number) => { col: number; row: number } | null;
  gridToWorld: (col: number, row: number) => { x: number; z: number };
  isWalkableWorld: (x: number, z: number) => boolean;
}

export function buildNavGrid(resolution = 0.3, padding = 0.35): NavGrid {
  const minX = -22;
  const maxX = 22;
  const minZ = -13;
  const maxZ = 13;

  const cols = Math.ceil((maxX - minX) / resolution);
  const rows = Math.ceil((maxZ - minZ) / resolution);

  // Initialize all as unwalkable
  const walkable: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));

  const worldToGrid = (x: number, z: number) => {
    if (x < minX || x > maxX || z < minZ || z > maxZ) return null;
    const col = Math.floor((x - minX) / resolution);
    const row = Math.floor((z - minZ) / resolution);
    if (col < 0 || col >= cols || row < 0 || row >= rows) return null;
    return { col, row };
  };

  const gridToWorld = (col: number, row: number) => {
    const x = minX + (col + 0.5) * resolution;
    const z = minZ + (row + 0.5) * resolution;
    return { x, z };
  };

  // Helper: check if point (x,z) is inside any room bounds
  const getRoomAt = (x: number, z: number): RoomDefinition | null => {
    for (const room of floorPlan.rooms) {
      if (
        x >= room.bounds.minX &&
        x <= room.bounds.maxX &&
        z >= room.bounds.minZ &&
        z <= room.bounds.maxZ
      ) {
        return room;
      }
    }
    return null;
  };

  // Helper: check if point (x,z) is inside any doorway gap
  const isInsideDoorway = (x: number, z: number): boolean => {
    for (const room of floorPlan.rooms) {
      for (const door of room.doors) {
        const dx = Math.abs(x - door.position[0]);
        const dz = Math.abs(z - door.position[2]);
        // Allow a comfortable threshold around the door center
        if (door.wall === 'north' || door.wall === 'south') {
          if (dx <= door.width / 2 && dz <= 0.6) return true;
        } else {
          if (dz <= door.width / 2 && dx <= 0.6) return true;
        }
      }
    }
    return false;
  };

  // Helper: check if point (x,z) is too close to a wall edge
  const isNearWallEdge = (x: number, z: number, room: RoomDefinition): boolean => {
    const wallMargin = padding;
    const nearMinX = Math.abs(x - room.bounds.minX) < wallMargin;
    const nearMaxX = Math.abs(x - room.bounds.maxX) < wallMargin;
    const nearMinZ = Math.abs(z - room.bounds.minZ) < wallMargin;
    const nearMaxZ = Math.abs(z - room.bounds.maxZ) < wallMargin;

    if (nearMinX || nearMaxX || nearMinZ || nearMaxZ) {
      // If it's near a wall, check if it's a doorway
      return !isInsideDoorway(x, z);
    }
    return false;
  };

  // Helper: check if point (x,z) collides with furniture
  const collidesWithFurniture = (x: number, z: number, room: RoomDefinition): boolean => {
    for (const item of room.furniture) {
      // Approximate furniture radius based on type
      let radius = 0.55;
      if (item.type === 'whiteboard' || item.type === 'projector') continue; // Mounted high up on wall/ceiling
      if (item.type === 'desk_pc') radius = 0.55;
      if (item.type === 'teacher_desk') radius = 0.8;
      if (item.type === 'cubicle') radius = 0.85;
      if (item.type === 'server_rack' || item.type === 'cabinet') radius = 0.7;
      if (item.type === 'sofa') radius = 0.65;
      if (item.type === 'sink') radius = 0.5;

      const dist = Math.hypot(x - item.position[0], z - item.position[2]);
      if (dist < radius + padding * 0.5) {
        return true;
      }
    }
    return false;
  };

  // Rasterize grid
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const { x, z } = gridToWorld(c, r);
      const room = getRoomAt(x, z);

      if (!room) {
        walkable[r][c] = false;
        continue;
      }

      // Check if inside doorway (always walkable)
      if (isInsideDoorway(x, z)) {
        walkable[r][c] = true;
        continue;
      }

      // Check wall proximity
      if (isNearWallEdge(x, z, room)) {
        walkable[r][c] = false;
        continue;
      }

      // Check furniture obstacle
      if (collidesWithFurniture(x, z, room)) {
        walkable[r][c] = false;
        continue;
      }

      walkable[r][c] = true;
    }
  }

  const isWalkableWorld = (x: number, z: number): boolean => {
    const coords = worldToGrid(x, z);
    if (!coords) return false;
    return walkable[coords.row][coords.col];
  };

  return {
    minX,
    maxX,
    minZ,
    maxZ,
    resolution,
    cols,
    rows,
    walkable,
    worldToGrid,
    gridToWorld,
    isWalkableWorld,
  };
}

export const defaultNavGrid = buildNavGrid();
