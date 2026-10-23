import floorPlanData from './floorplan.json';
import { FloorPlanData, POI } from '../types/floorplan';

export const typedFloorPlan: FloorPlanData = floorPlanData as unknown as FloorPlanData;

export function getAllPOIs(): POI[] {
  const pois: POI[] = [];

  // 1. Add All Real Rooms/Spaces
  typedFloorPlan.rooms.forEach((room) => {
    pois.push({
      id: room.id,
      name: room.name,
      category: 'room',
      roomId: room.id,
      roomName: room.name,
      position: [room.labelPosition[0], 0.5, room.labelPosition[2]],
      description: `${room.type.toUpperCase()} zone • Prototyping Lab`
    });

    // 2. Add Key Furniture / Tool Landmarks
    (room.furniture || []).forEach((item: any) => {
      let category: POI['category'] = 'workstation';
      if (item.type === 'pegboard' || item.type === 'drill_press' || item.type === 'laser_cutter' || item.type === 'printer_3d') {
        category = 'workstation';
      } else if (item.type === 'fire_extinguisher' || item.id.includes('exit')) {
        category = 'exit';
      } else if (item.type === 'kiosk' || item.type === 'wall_tv' || item.type === 'poster') {
        category = 'amenity';
      }

      pois.push({
        id: item.id,
        name: item.label || item.name || item.id,
        category,
        roomId: room.id,
        roomName: room.name,
        position: [item.position[0], 0.5, item.position[2]],
        description: `Located in ${room.name}`,
        isEmergency: item.type === 'fire_extinguisher' || item.id.includes('exit')
      });
    });
  });

  // 3. Add Dedicated Exits
  (typedFloorPlan.exits || []).forEach((exit) => {
    pois.push({
      id: exit.id,
      name: exit.name,
      category: 'exit',
      roomId: 'entrance',
      roomName: 'Entrance & Reception',
      position: exit.position,
      description: 'Emergency Evacuation Exit',
      isEmergency: exit.isEmergencyExit
    });
  });

  return pois;
}

export const ALL_POIS: POI[] = getAllPOIs();
