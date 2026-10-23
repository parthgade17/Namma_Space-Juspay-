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
  walkable: boolean[][];
  worldToGrid: (x: number, z: number) => { col: number; row: number } | null;
  gridToWorld: (col: number, row: number) => { x: number; z: number };
  isWalkableWorld: (x: number, z: number) => boolean;
}

export function buildNavGrid(resolution = 0.25, padding = 0.3): NavGrid {
  const minX = -10.5;
  const maxX = 10.0;
  const minZ = -6.2;
  const maxZ = 6.0;

  const cols = Math.ceil((maxX - minX) / resolution);
  const rows = Math.ceil((maxZ - minZ) / resolution);

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

  const isInsideDoorway = (x: number, z: number): boolean => {
    for (const room of floorPlan.rooms) {
      for (const door of room.doors || []) {
        const dx = Math.abs(x - door.position[0]);
        const dz = Math.abs(z - door.position[2]);
        if (door.wall === 'north' || door.wall === 'south') {
          if (dx <= (door.width / 2) + 0.1 && dz <= 0.45) return true;
        } else {
          if (dz <= (door.width / 2) + 0.1 && dx <= 0.45) return true;
        }
      }
    }
    return false;
  };

  const isNearWallEdge = (x: number, z: number, room: RoomDefinition): boolean => {
    const wallMargin = padding;
    const nearMinX = Math.abs(x - room.bounds.minX) < wallMargin;
    const nearMaxX = Math.abs(x - room.bounds.maxX) < wallMargin;
    const nearMinZ = Math.abs(z - room.bounds.minZ) < wallMargin;
    const nearMaxZ = Math.abs(z - room.bounds.maxZ) < wallMargin;

    if (nearMinX || nearMaxX || nearMinZ || nearMaxZ) {
      return !isInsideDoorway(x, z);
    }
    return false;
  };

  const collidesWithFurniture = (x: number, z: number, room: RoomDefinition): boolean => {
    for (const item of room.furniture || []) {
      if (item.type === 'pegboard' || item.type === 'poster' || item.type === 'poster_row' || item.type === 'socket_bar' || item.type === 'wall_tv') {
        continue; // Wall-mounted
      }

      let rad = 0.5;
      if (item.type === 'workbench' || item.type === 'meeting_table') rad = 0.75;
      else if (item.type === 'laser_cutter') rad = 0.85;
      else if (item.type === 'storage_boxes') rad = 0.65;
      else if (item.type === 'grey_chair' || item.type === 'black_office_chair') rad = 0.35;

      const dist = Math.hypot(x - item.position[0], z - item.position[2]);
      if (dist < rad + padding * 0.4) {
        return true;
      }
    }
    return false;
  };

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const { x, z } = gridToWorld(c, r);
      const room = getRoomAt(x, z);

      if (!room) {
        walkable[r][c] = false;
        continue;
      }

      if (isInsideDoorway(x, z)) {
        walkable[r][c] = true;
        continue;
      }

      if (isNearWallEdge(x, z, room)) {
        walkable[r][c] = false;
        continue;
      }

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
