import { TurnDirection } from '../state/useStore';
import { POI } from '../types/floorplan';
import floorPlanData from '../data/floorplan.json';

const floorPlan = floorPlanData;

export function generateTurnDirections(
  path: [number, number, number][],
  targetPOI: POI | null
): { directions: TurnDirection[]; totalDistance: number } {
  if (path.length < 2) {
    return { directions: [], totalDistance: 0 };
  }

  const directions: TurnDirection[] = [];
  let totalDist = 0;

  // Compute total distance
  for (let i = 0; i < path.length - 1; i++) {
    const p1 = path[i];
    const p2 = path[i + 1];
    totalDist += Math.hypot(p2[0] - p1[0], p2[2] - p1[2]);
  }

  // Identify room at coordinate
  const getRoomNameAt = (x: number, z: number): string => {
    for (const r of floorPlan.rooms) {
      if (x >= r.bounds.minX && x <= r.bounds.maxX && z >= r.bounds.minZ && z <= r.bounds.maxZ) {
        return r.name;
      }
    }
    return 'Corridor';
  };

  // Initial step
  const startRoom = getRoomNameAt(path[0][0], path[0][2]);
  const destName = targetPOI?.name || 'Destination';

  if (path.length <= 3) {
    directions.push({
      id: 'step-0',
      instruction: `Head straight toward ${destName}`,
      distance: Math.round(totalDist * 10) / 10,
      icon: 'straight'
    });
    directions.push({
      id: 'step-final',
      instruction: `Arrive at ${destName}`,
      distance: 0,
      icon: 'arrival'
    });
    return { directions, totalDistance: Math.round(totalDist * 10) / 10 };
  }

  // Walk through segments and detect turns
  let currentSegmentDist = 0;
  let lastVector = [path[1][0] - path[0][0], path[1][2] - path[0][2]];

  directions.push({
    id: `step-0`,
    instruction: `Start in ${startRoom}, follow the glowing path`,
    distance: Math.round(Math.hypot(lastVector[0], lastVector[1]) * 10) / 10,
    icon: 'straight'
  });

  for (let i = 1; i < path.length - 1; i++) {
    const pPrev = path[i - 1];
    const pCurr = path[i];
    const pNext = path[i + 1];

    const v1 = [pCurr[0] - pPrev[0], pCurr[2] - pPrev[2]];
    const v2 = [pNext[0] - pCurr[0], pNext[2] - pCurr[2]];

    const len1 = Math.hypot(v1[0], v1[1]);
    const len2 = Math.hypot(v2[0], v2[1]);
    if (len1 < 0.1 || len2 < 0.1) continue;

    const segDist = len2;
    currentSegmentDist += segDist;

    // Cross product to find turn direction: v1.x * v2.y - v1.y * v2.x (in 2D X-Z)
    const cross = v1[0] * v2[1] - v1[1] * v2[0];
    const dot = v1[0] * v2[0] + v1[1] * v2[1];
    const angle = Math.atan2(cross, dot) * (180 / Math.PI);

    // If turn angle is notable (> 25 degrees)
    if (Math.abs(angle) > 25) {
      const roomHere = getRoomNameAt(pNext[0], pNext[2]);
      const turnType: 'left' | 'right' = angle > 0 ? 'right' : 'left';
      directions.push({
        id: `step-${i}`,
        instruction: `Turn ${turnType} into ${roomHere}`,
        distance: Math.round(currentSegmentDist * 10) / 10,
        icon: turnType
      });
      currentSegmentDist = 0;
    }
  }

  // Final arrival step
  directions.push({
    id: 'step-final',
    instruction: `Arrive at ${destName}`,
    distance: 0,
    icon: 'arrival'
  });

  return { directions, totalDistance: Math.round(totalDist * 10) / 10 };
}
