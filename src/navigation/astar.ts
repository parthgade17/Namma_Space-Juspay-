import { NavGrid, defaultNavGrid } from './navGrid';

interface Node {
  col: number;
  row: number;
  g: number;
  h: number;
  f: number;
  parent: Node | null;
}

// Find nearest walkable cell in grid if starting point or destination is inside an obstacle
function findNearestWalkable(grid: NavGrid, col: number, row: number, maxRadius = 15): { col: number; row: number } | null {
  if (grid.walkable[row]?.[col]) return { col, row };

  for (let r = 1; r <= maxRadius; r++) {
    for (let dc = -r; dc <= r; dc++) {
      for (let dr = -r; dr <= r; dr++) {
        if (Math.abs(dc) === r || Math.abs(dr) === r) {
          const nc = col + dc;
          const nr = row + dr;
          if (nr >= 0 && nr < grid.rows && nc >= 0 && nc < grid.cols) {
            if (grid.walkable[nr][nc]) {
              return { col: nc, row: nr };
            }
          }
        }
      }
    }
  }
  return null;
}

// 8-directional neighbor offsets with costs
const DIRECTIONS = [
  { dc: 0, dr: -1, cost: 1.0 },   // North
  { dc: 0, dr: 1, cost: 1.0 },    // South
  { dc: 1, dr: 0, cost: 1.0 },    // East
  { dc: -1, dr: 0, cost: 1.0 },   // West
  { dc: 1, dr: -1, cost: 1.414 }, // NE
  { dc: -1, dr: -1, cost: 1.414 },// NW
  { dc: 1, dr: 1, cost: 1.414 },  // SE
  { dc: -1, dr: 1, cost: 1.414 }, // SW
];

export function findPath(
  startX: number,
  startZ: number,
  targetX: number,
  targetZ: number,
  grid: NavGrid = defaultNavGrid
): [number, number, number][] {
  const startCoords = grid.worldToGrid(startX, startZ);
  const targetCoords = grid.worldToGrid(targetX, targetZ);

  if (!startCoords || !targetCoords) return [];

  const startValid = findNearestWalkable(grid, startCoords.col, startCoords.row);
  const targetValid = findNearestWalkable(grid, targetCoords.col, targetCoords.row);

  if (!startValid || !targetValid) return [];

  const openSet: Node[] = [];
  const closedSet = new Set<string>();
  const nodeMap = new Map<string, Node>();

  const key = (c: number, r: number) => `${c},${r}`;

  const heuristic = (c1: number, r1: number, c2: number, r2: number) => {
    // Octile / Euclidean distance
    const dx = Math.abs(c1 - c2);
    const dz = Math.abs(r1 - r2);
    return Math.hypot(dx, dz);
  };

  const startNode: Node = {
    col: startValid.col,
    row: startValid.row,
    g: 0,
    h: heuristic(startValid.col, startValid.row, targetValid.col, targetValid.row),
    f: 0,
    parent: null,
  };
  startNode.f = startNode.g + startNode.h;

  openSet.push(startNode);
  nodeMap.set(key(startValid.col, startValid.row), startNode);

  let targetFoundNode: Node | null = null;
  let iterations = 0;
  const MAX_ITERATIONS = 4000;

  while (openSet.length > 0 && iterations++ < MAX_ITERATIONS) {
    // Pick lowest f node
    let bestIdx = 0;
    for (let i = 1; i < openSet.length; i++) {
      if (openSet[i].f < openSet[bestIdx].f) {
        bestIdx = i;
      }
    }

    const current = openSet.splice(bestIdx, 1)[0];
    closedSet.add(key(current.col, current.row));

    // Reached target?
    if (current.col === targetValid.col && current.row === targetValid.row) {
      targetFoundNode = current;
      break;
    }

    for (const dir of DIRECTIONS) {
      const nc = current.col + dir.dc;
      const nr = current.row + dir.dr;

      if (nc < 0 || nc >= grid.cols || nr < 0 || nr >= grid.rows) continue;
      if (!grid.walkable[nr][nc]) continue;
      if (closedSet.has(key(nc, nr))) continue;

      // Prevent corner cutting across diagonals
      if (dir.dc !== 0 && dir.dr !== 0) {
        if (!grid.walkable[current.row][nc] || !grid.walkable[nr][current.col]) {
          continue;
        }
      }

      const tentativeG = current.g + dir.cost;
      const neighborKey = key(nc, nr);
      let neighborNode = nodeMap.get(neighborKey);

      if (!neighborNode) {
        neighborNode = {
          col: nc,
          row: nr,
          g: tentativeG,
          h: heuristic(nc, nr, targetValid.col, targetValid.row),
          f: 0,
          parent: current,
        };
        neighborNode.f = neighborNode.g + neighborNode.h;
        nodeMap.set(neighborKey, neighborNode);
        openSet.push(neighborNode);
      } else if (tentativeG < neighborNode.g) {
        neighborNode.g = tentativeG;
        neighborNode.f = neighborNode.g + neighborNode.h;
        neighborNode.parent = current;
      }
    }
  }

  if (!targetFoundNode) return [];

  // Reconstruct raw path
  const rawPath: { x: number; z: number }[] = [];
  let curr: Node | null = targetFoundNode;
  while (curr) {
    const world = grid.gridToWorld(curr.col, curr.row);
    rawPath.push(world);
    curr = curr.parent;
  }
  rawPath.reverse();

  // Smooth path using raycasting line-of-sight test
  const smoothed = smoothPath(rawPath, grid);

  // Convert to 3D coords with elevation slightly above ground (Y = 0.08)
  const result: [number, number, number][] = [
    [startX, 0.08, startZ],
    ...smoothed.map(p => [p.x, 0.08, p.z] as [number, number, number]),
    [targetX, 0.08, targetZ]
  ];

  return result;
}

// Line of sight raycasting test across grid
function hasLineOfSight(p1: { x: number; z: number }, p2: { x: number; z: number }, grid: NavGrid): boolean {
  const steps = Math.ceil(Math.hypot(p2.x - p1.x, p2.z - p1.z) / (grid.resolution * 0.5));
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const x = p1.x + (p2.x - p1.x) * t;
    const z = p1.z + (p2.z - p1.z) * t;
    if (!grid.isWalkableWorld(x, z)) return false;
  }
  return true;
}

// String-pulling smoothing algorithm
function smoothPath(points: { x: number; z: number }[], grid: NavGrid): { x: number; z: number }[] {
  if (points.length <= 2) return points;

  const smoothed: { x: number; z: number }[] = [points[0]];
  let currentIndex = 0;

  while (currentIndex < points.length - 1) {
    let furthestVisible = currentIndex + 1;
    // Look ahead as far as possible
    for (let testIdx = points.length - 1; testIdx > currentIndex + 1; testIdx--) {
      if (hasLineOfSight(points[currentIndex], points[testIdx], grid)) {
        furthestVisible = testIdx;
        break;
      }
    }
    smoothed.push(points[furthestVisible]);
    currentIndex = furthestVisible;
  }

  return smoothed;
}
