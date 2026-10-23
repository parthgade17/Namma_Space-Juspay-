export interface BoundingBox2D {
  x: number;
  z: number;
  width: number;
  depth: number;
}

export interface Doorway {
  id: string;
  wall: 'north' | 'south' | 'east' | 'west';
  position: [number, number, number];
  width: number;
  height: number;
  connectsTo?: string;
  label?: string;
}

export type RealLabFurnitureType =
  | 'pegboard'
  | 'workbench'
  | 'drill_press'
  | 'chop_saw'
  | 'step_stool'
  | 'grey_chair'
  | 'black_office_chair'
  | 'wall_desk'
  | 'socket_bar'
  | 'oscilloscope'
  | 'power_supply'
  | 'laptop'
  | 'fire_extinguisher'
  | 'printer_3d'
  | 'pc_monitor'
  | 'wooden_desk'
  | 'laser_cutter'
  | 'small_desk'
  | 'wall_tv'
  | 'meeting_table'
  | 'storage_boxes'
  | 'kiosk'
  | 'poster'
  | 'poster_row'
  | 'wooden_door'
  | 'desk_pc'
  | 'teacher_desk'
  | 'chair'
  | 'whiteboard'
  | 'projector'
  | 'cabinet'
  | 'sofa'
  | 'potted_plant'
  | 'sink'
  | 'cubicle'
  | 'server_rack'
  | 'bookshelf';

export interface FurnitureItem {
  id: string;
  name?: string;
  type: RealLabFurnitureType;
  position: [number, number, number];
  rotation: [number, number, number];
  scale?: [number, number, number];
  label?: string;
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
  type: 'corridor' | 'entrance' | 'workshop' | 'electronics' | 'printing' | 'laser' | 'meeting' | 'study' | 'storage' | 'lab' | 'office' | 'washroom' | 'staircase' | 'exit';
  color?: string;
  bounds: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
  };
  doors?: Doorway[];
  furniture?: FurnitureItem[];
  labelPosition: [number, number, number];
  ceilingHeight?: number;
}

export interface FloorPlanData {
  floorId: string;
  buildingName: string;
  floorLevel: string;
  dimensions: {
    width: number;
    depth: number;
    ceilingHeight: number;
    corridorWidth?: number;
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
