import { create } from 'zustand';
import { POI } from '../types/floorplan';
import floorPlanData from '../data/floorplan.json';

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

export interface ScanConfig {
  splatUrl: string;
  rotation: [number, number, number];
  scale: number;
  modelY: number;
  eyeHeight: number;
  start: [number, number];
  startYaw: number;
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number } | null;
  speed: number;
  near: number;
  fov: number;
}

export interface FloorPlanTransform {
  x: number;
  z: number;
  rotation: number; // in radians
  scale: number;
}

interface AppState {
  // App views
  currentMode: 'roam' | 'pipeline';
  
  // Scan Configuration & Loading
  scanConfig: ScanConfig;
  splatLoading: {
    progress: number;
    isLoaded: boolean;
    error: string | null;
  };
  
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

  // Real Scan / Nav Layer Visibility
  showNavLayer: boolean; // default false
  isAlignMode: boolean; // Floor plan alignment orthographic mode
  floorPlanTransform: FloorPlanTransform;
  dynamicFloorPlan: typeof floorPlanData;

  // UI & Quality Controls
  showLabels: boolean;
  quality: 'high' | 'balanced' | 'low';
  isCalibrationOpen: boolean; // Key T
  isSettingsOpen: boolean;

  // Selected Object
  selectedObject: SelectedObjectInfo | null;
  fps: number;

  // Actions
  setCurrentMode: (mode: 'roam' | 'pipeline') => void;
  setScanConfig: (cfg: Partial<ScanConfig>) => void;
  setSplatLoading: (loading: Partial<AppState['splatLoading']>) => void;
  setUserPosition: (pos: [number, number, number]) => void;
  setUserRotation: (yaw: number) => void;
  setDestination: (poi: POI | null) => void;
  setNavigationRoute: (path: [number, number, number][], directions: TurnDirection[], distance: number) => void;
  clearNavigation: () => void;
  setIsAutoWalking: (val: boolean) => void;
  triggerEmergencyMode: () => void;
  resetEmergencyMode: () => void;
  
  toggleNavLayer: () => void;
  toggleAlignMode: () => void;
  setFloorPlanTransform: (transform: Partial<FloorPlanTransform>) => void;
  setDynamicFloorPlan: (data: typeof floorPlanData) => void;
  setShowLabels: (show: boolean) => void;
  setQuality: (q: 'high' | 'balanced' | 'low') => void;
  toggleCalibration: () => void;
  setIsCalibrationOpen: (open: boolean) => void;
  toggleSettings: () => void;
  setSelectedObject: (obj: SelectedObjectInfo | null) => void;
  setFps: (fps: number) => void;
}

const DEFAULT_CONFIG: ScanConfig = {
  splatUrl: '/lab.spz',
  rotation: [-90, 0, 0],
  scale: 5,
  modelY: 1.6,
  eyeHeight: 1.6,
  start: [0, 0],
  startYaw: 0,
  bounds: { minX: -18, maxX: 18, minZ: -10, maxZ: 10 },
  speed: 1.6,
  near: 0.35,
  fov: 62,
};

export const useStore = create<AppState>((set) => ({
  currentMode: 'roam',
  
  scanConfig: DEFAULT_CONFIG,
  splatLoading: {
    progress: 0,
    isLoaded: false,
    error: null,
  },

  userPosition: [DEFAULT_CONFIG.start[0], DEFAULT_CONFIG.eyeHeight, DEFAULT_CONFIG.start[1]],
  userRotation: (DEFAULT_CONFIG.startYaw * Math.PI) / 180,

  activeDestination: null,
  activePath: [],
  activeTurnDirections: [],
  totalPathDistance: 0,
  estimatedTimeSeconds: 0,
  isAutoWalking: false,
  isEmergency: false,

  showNavLayer: false, // INVISIBLE by default
  isAlignMode: false,
  floorPlanTransform: { x: 0, z: 0, rotation: 0, scale: 1 },
  dynamicFloorPlan: floorPlanData,

  showLabels: true,
  quality: 'balanced',
  isCalibrationOpen: false,
  isSettingsOpen: false,

  selectedObject: null,
  fps: 60,

  setCurrentMode: (mode) => set({ currentMode: mode }),
  setScanConfig: (cfg) => set((s) => ({ scanConfig: { ...s.scanConfig, ...cfg } })),
  setSplatLoading: (loading) => set((s) => ({ splatLoading: { ...s.splatLoading, ...loading } })),
  setUserPosition: (pos) => set({ userPosition: pos }),
  setUserRotation: (yaw) => set({ userRotation: yaw }),
  setDestination: (poi) => set({ activeDestination: poi }),
  setNavigationRoute: (path, directions, distance) => set({
    activePath: path,
    activeTurnDirections: directions,
    totalPathDistance: distance,
    estimatedTimeSeconds: Math.ceil(distance / 1.3),
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

  toggleNavLayer: () => set((s) => ({ showNavLayer: !s.showNavLayer })),
  toggleAlignMode: () => set((s) => ({ isAlignMode: !s.isAlignMode })),
  setFloorPlanTransform: (t) => set((s) => ({ floorPlanTransform: { ...s.floorPlanTransform, ...t } })),
  setDynamicFloorPlan: (data) => set({ dynamicFloorPlan: data }),
  setShowLabels: (show) => set({ showLabels: show }),
  setQuality: (q) => set({ quality: q }),
  toggleCalibration: () => set((s) => ({ isCalibrationOpen: !s.isCalibrationOpen })),
  setIsCalibrationOpen: (open) => set({ isCalibrationOpen: open }),
  toggleSettings: () => set((s) => ({ isSettingsOpen: !s.isSettingsOpen })),
  setSelectedObject: (obj) => set({ selectedObject: obj }),
  setFps: (fps) => set({ fps }),
}));
