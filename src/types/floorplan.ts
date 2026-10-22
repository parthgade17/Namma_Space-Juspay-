export interface BoundingBox2D {
  x: number; // Center or min
  z: number;
  width: number; // Dimension along X
  depth: number; // Dimension along Z
}

export interface Doorway {
  id: string;
  wall: 'north' | 'south' | 'east' | 'west';
  position: [number, number, number]; // [x, y, z] center of doorway
  width: number;
  height: number;
  connectsTo?: string; // Room ID
  label?: string;
}

export interface FurnitureItem {
  id: string;
  type: 'desk_pc' | 'teacher_desk' | 'chair' | 'whiteboard' | 'projector' | 'cabinet' | 'sofa' | 'potted_plant' | 'sink' | 'cubicle' | 'server_rack' | 'bookshelf';
  position: [number, number, number]; // [x, y, z]
  rotation: [number, number, number]; // Euler angles [rx, ry, rz]
  scale?: [number, number, number];
  label?: string; // e.g., "PC-01"
  meta?: {
    specs?: string;
    department?: string;
    assignedTo?: string;
    status?: 'Available' | 'Occupied' | 'Maintenance';
  };
}

export interface RoomDefinition {
  id: string;
  name: string;
  type: 'lab' | 'corridor' | 'office' | 'washroom' | 'staircase' | 'exit';
  color: string;
  bounds: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
  };
  doors: Doorway[];
  furniture: FurnitureItem[];
  labelPosition: [number, number, number];
  ceilingHeight: number;
  floorTexture?: 'tiles' | 'wood' | 'carpet' | 'concrete';
  wallColor?: string;
}

export interface FloorPlanData {
  floorId: string;
  buildingName: string;
  floorLevel: string;
  dimensions: {
    width: number;
    depth: number;
    ceilingHeight: number;
  };
  rooms: RoomDefinition[];
  exits: {
    id: string;
    name: string;
    position: [number, number, number];
    isEmergencyExit: boolean;
  }[];
}

export interface POI {
  id: string;
  name: string;
  category: 'room' | 'workstation' | 'faculty' | 'amenity' | 'exit';
  roomId: string;
  roomName: string;
  position: [number, number, number];
  description?: string;
  isEmergency?: boolean;
}
