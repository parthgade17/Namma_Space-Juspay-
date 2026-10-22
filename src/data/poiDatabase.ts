import floorPlanData from './floorplan.json';
import { FloorPlanData, POI } from '../types/floorplan';

export const typedFloorPlan: FloorPlanData = floorPlanData as unknown as FloorPlanData;

// Extract and index all POIs from floorplan
export function getAllPOIs(): POI[] {
  const pois: POI[] = [];

  // 1. Add All Rooms
  typedFloorPlan.rooms.forEach((room) => {
    pois.push({
      id: room.id,
      name: room.name,
      category: 'room',
      roomId: room.id,
      roomName: room.name,
      position: [
        room.labelPosition[0],
        0.5,
        room.labelPosition[2]
      ],
      description: `${room.type.toUpperCase()} • ${room.bounds.maxX - room.bounds.minX}m × ${room.bounds.maxZ - room.bounds.minZ}m area`
    });

    // 2. Add Furniture POIs
    room.furniture.forEach((item) => {
      let category: POI['category'] = 'amenity';
      if (item.type === 'desk_pc') {
        category = 'workstation';
      } else if (item.type === 'cubicle' || room.id === 'hod-cabin' || item.type === 'teacher_desk') {
        category = 'faculty';
      } else if (item.id.includes('exit') || item.id.includes('fire')) {
        category = 'exit';
      }

      pois.push({
        id: item.id,
        name: item.label || item.id,
        category,
        roomId: room.id,
        roomName: room.name,
        position: [item.position[0], 0.5, item.position[2]],
        description: item.meta ? `${item.meta.assignedTo || ''} • ${item.meta.specs || item.meta.status || ''}` : `Located in ${room.name}`,
        isEmergency: item.id.includes('fire')
      });
    });
  });

  // 3. Add Dedicated Exits
  typedFloorPlan.exits.forEach((exit) => {
    pois.push({
      id: exit.id,
      name: exit.name,
      category: 'exit',
      roomId: 'main-exit',
      roomName: 'Main Entrance & Emergency Exit',
      position: exit.position,
      description: 'Emergency Evacuation Route',
      isEmergency: exit.isEmergencyExit
    });
  });

  return pois;
}

export const ALL_POIS: POI[] = getAllPOIs();
