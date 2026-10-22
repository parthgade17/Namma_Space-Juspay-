import { create } from 'zustand';
import { POI } from '../types/floorplan';

export interface TurnDirection {
  id: string;
  instruction: string;
  distance: number;
  icon: 'straight' | 'left' | 'right' | 'arrival';
}

export interface SelectedObjectInfo {
  id: string;
  name: string;
  room: string;
  type: string;
  position: [number, number, number];
  meta?: Record<string, string | undefined>;
}

export interface CustomModelData {
  url: string;
  name: string;
  format: 'glb' | 'gltf' | 'ply';
  isLoaded: boolean;
  scale?: number;
}

interface AppState {
  // App views
  currentMode: 'pipeline' | 'roam';
  cameraMode: 'fps' | 'orbit';
  
  // User state in 3D
  userPosition: [number, number, number];
  userRotation: number; // yaw in radians
  
  // Navigation
  activeDestination: POI | null;
  activePath: [number, number, number][];
  activeTurnDirections: TurnDirection[];
  totalPathDistance: number;
  estimatedTimeSeconds: number;
  isAutoWalking: boolean;
  isEmergency: boolean;

  // View / Graphic Toggles
  showCeiling: boolean;
  showLabels: boolean;
  showShadows: boolean;
  showWireframe: boolean;
  showPointCloud: boolean;
  performanceMode: boolean;
  collisionEnabled: boolean;

  // Object Inspection & Custom Scans
  selectedObject: SelectedObjectInfo | null;
  customModel: CustomModelData | null;
  customPOIs: POI[];
  isPlacingPOI: boolean;

  // Diagnostics
  fps: number;

  // Actions
  setCurrentMode: (mode: 'pipeline' | 'roam') => void;
  setCameraMode: (cam: 'fps' | 'orbit') => void;
  setUserPosition: (pos: [number, number, number]) => void;
  setUserRotation: (yaw: number) => void;
  setDestination: (poi: POI | null) => void;
  setNavigationRoute: (path: [number, number, number][], directions: TurnDirection[], distance: number) => void;
  clearNavigation: () => void;
  setIsAutoWalking: (val: boolean) => void;
  triggerEmergencyMode: () => void;
  resetEmergencyMode: () => void;
  toggleCeiling: () => void;
  toggleLabels: () => void;
  toggleShadows: () => void;
  toggleWireframe: () => void;
  togglePointCloud: () => void;
  togglePerformanceMode: () => void;
  toggleCollision: () => void;
  setSelectedObject: (obj: SelectedObjectInfo | null) => void;
  setCustomModel: (model: CustomModelData | null) => void;
  addCustomPOI: (poi: POI) => void;
  setIsPlacingPOI: (placing: boolean) => void;
  setFps: (fps: number) => void;
}

export const useStore = create<AppState>((set, get) => ({
  // Defaults: start in pipeline screen to show the Scan->Reconstruct workflow, with quick launch to roam
  currentMode: 'pipeline',
  cameraMode: 'orbit', // defaults to dollhouse/orbit so user sees whole floor first, with 1-click FPS
  userPosition: [0, 1.6, 0], // corridor center
  userRotation: 0,

  activeDestination: null,
  activePath: [],
  activeTurnDirections: [],
  totalPathDistance: 0,
  estimatedTimeSeconds: 0,
  isAutoWalking: false,
  isEmergency: false,

  showCeiling: false, // hidden in dollhouse by default
  showLabels: true,
  showShadows: true,
  showWireframe: false,
  showPointCloud: false,
  performanceMode: false,
  collisionEnabled: true,

  selectedObject: null,
  customModel: null,
  customPOIs: [],
  isPlacingPOI: false,

  fps: 60,

  setCurrentMode: (mode) => set({ currentMode: mode }),
  setCameraMode: (cam) => set((state) => ({
    cameraMode: cam,
    // Automatically manage ceiling visibility for best UX:
    // If switching to fps, show ceiling (unless user specifically toggled it off); in orbit, hide ceiling so dollhouse is visible!
    showCeiling: cam === 'fps' ? true : false
  })),
  setUserPosition: (pos) => set({ userPosition: pos }),
  setUserRotation: (yaw) => set({ userRotation: yaw }),
  setDestination: (poi) => set({ activeDestination: poi }),
  setNavigationRoute: (path, directions, distance) => set({
    activePath: path,
    activeTurnDirections: directions,
    totalPathDistance: distance,
    estimatedTimeSeconds: Math.ceil(distance / 1.3), // avg human walking speed 1.3 m/s
  }),
  clearNavigation: () => set({
    activeDestination: null,
    activePath: [],
    activeTurnDirections: [],
    totalPathDistance: 0,
    estimatedTimeSeconds: 0,
    isAutoWalking: false,
    isEmergency: false,
  }),
  setIsAutoWalking: (val) => set({ isAutoWalking: val }),
  triggerEmergencyMode: () => set({ isEmergency: true }),
  resetEmergencyMode: () => set({ isEmergency: false }),

  toggleCeiling: () => set((state) => ({ showCeiling: !state.showCeiling })),
  toggleLabels: () => set((state) => ({ showLabels: !state.showLabels })),
  toggleShadows: () => set((state) => ({ showShadows: !state.showShadows })),
  toggleWireframe: () => set((state) => ({ showWireframe: !state.showWireframe })),
  togglePointCloud: () => set((state) => ({ showPointCloud: !state.showPointCloud })),
  togglePerformanceMode: () => set((state) => ({
    performanceMode: !state.performanceMode,
    showShadows: state.performanceMode ? true : false // Disable shadows in perf mode
  })),
  toggleCollision: () => set((state) => ({ collisionEnabled: !state.collisionEnabled })),

  setSelectedObject: (obj) => set({ selectedObject: obj }),
  setCustomModel: (model) => set({ customModel: model }),
  addCustomPOI: (poi) => set((state) => ({ customPOIs: [...state.customPOIs, poi] })),
  setIsPlacingPOI: (placing) => set({ isPlacingPOI: placing }),
  setFps: (fps) => set({ fps }),
}));
