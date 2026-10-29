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
  rotation: number;
  scale: number;
}

interface AppState {
  // App views
  currentMode: 'roam' | 'pipeline';
  viewMode: 'mesh' | 'splat'; // 'mesh' = 3D Model (default), 'splat' = Real Scan
  isTopDownView: boolean; // Top-down architectural plan view for mesh only

  // Scan Configuration & Loading
  scanConfig: ScanConfig;
  splatLoading: {
    progress: number;
    isLoaded: boolean;
    error: string | null;
  };

  // User state in 3D
  userPosition: [number, number, number];
  userRotation: number;
  cameraPerspective: 'follow' | 'fpv'; // 'follow' = Google Maps 3D walking character view, 'fpv' = first-person eye view

  // Navigation
  activeDestination: POI | null;
  activePath: [number, number, number][];
  activeTurnDirections: TurnDirection[];
  totalPathDistance: number;
  estimatedTimeSeconds: number;
  isAutoWalking: boolean;
  isEmergency: boolean;

  // Alignment Mode & Dynamic Plan
  isAlignMode: boolean;
  floorPlanTransform: FloorPlanTransform;
  dynamicFloorPlan: typeof floorPlanData;

  // UI & Quality Controls
  showLabels: boolean;
  quality: 'auto' | 'high' | 'balanced' | 'low';
  autoDpr: number;
  showPerf: boolean;
  isCalibrationOpen: boolean; // Key T
  isSettingsOpen: boolean;

  // Selected Object & Arrival Toast
  selectedObject: SelectedObjectInfo | null;
  arrivalToast: string | null;
  fps: number;

  // Actions
  setCurrentMode: (mode: 'roam' | 'pipeline') => void;
  setViewMode: (v: 'mesh' | 'splat') => void;
  setIsTopDownView: (topDown: boolean) => void;
  toggleTopDownView: () => void;
  setScanConfig: (cfg: Partial<ScanConfig>) => void;
  setSplatLoading: (loading: Partial<AppState['splatLoading']>) => void;
  setUserPosition: (pos: [number, number, number]) => void;
  setUserRotation: (yaw: number) => void;
  setCameraPerspective: (p: 'follow' | 'fpv') => void;
  toggleCameraPerspective: () => void;
  setDestination: (poi: POI | null) => void;
  setNavigationRoute: (path: [number, number, number][], directions: TurnDirection[], distance: number) => void;
  clearNavigation: () => void;
  setIsAutoWalking: (val: boolean) => void;
  triggerEmergencyMode: () => void;
  resetEmergencyMode: () => void;

  toggleAlignMode: () => void;
  setFloorPlanTransform: (transform: Partial<FloorPlanTransform>) => void;
  setDynamicFloorPlan: (data: typeof floorPlanData) => void;
  setShowLabels: (show: boolean) => void;
  setQuality: (q: 'auto' | 'high' | 'balanced' | 'low') => void;
  setAutoDpr: (dpr: number) => void;
  togglePerf: () => void;
  toggleCalibration: () => void;
  setIsCalibrationOpen: (open: boolean) => void;
  toggleSettings: () => void;
  setSelectedObject: (obj: SelectedObjectInfo | null) => void;
  setArrivalToast: (msg: string | null) => void;
  setFps: (fps: number) => void;
}

const DEFAULT_CONFIG: ScanConfig = {
  splatUrl: '/lab.spz',
  rotation: [-90, 0, 0],
  scale: 5,
  modelY: 1.6,
  eyeHeight: 1.6,
  start: [-4.0, 0], // Start inside the central corridor near workshop & entrance
  startYaw: 90,     // Facing down the corridor
  bounds: { minX: -9.5, maxX: 8.5, minZ: -5.8, maxZ: 5.5 },
  speed: 1.3,
  near: 0.25,
  fov: 65,
};

export const useStore = create<AppState>((set) => ({
  currentMode: 'roam',
  viewMode: 'mesh', // "3D Model" is the DEFAULT as requested!
  isTopDownView: false,

  scanConfig: DEFAULT_CONFIG,
  splatLoading: {
    progress: 0,
    isLoaded: false,
    error: null,
  },

  userPosition: [DEFAULT_CONFIG.start[0], DEFAULT_CONFIG.eyeHeight, DEFAULT_CONFIG.start[1]],
  userRotation: (DEFAULT_CONFIG.startYaw * Math.PI) / 180,
  cameraPerspective: 'follow', // Default to 3D Google Maps Follow View so walking man is visible

  activeDestination: null,
  activePath: [],
  activeTurnDirections: [],
  totalPathDistance: 0,
  estimatedTimeSeconds: 0,
  isAutoWalking: false,
  isEmergency: false,

  isAlignMode: false,
  floorPlanTransform: { x: 0, z: 0, rotation: 0, scale: 1 },
  dynamicFloorPlan: floorPlanData,

  showLabels: true,
  quality: 'auto',
  autoDpr: 1.5,
  showPerf: false,
  isCalibrationOpen: false,
  isSettingsOpen: false,

  selectedObject: null,
  arrivalToast: null,
  fps: 60,

  setCurrentMode: (mode) => set({ currentMode: mode }),
  setViewMode: (v) => set({ viewMode: v }),
  setIsTopDownView: (topDown) => set({ isTopDownView: topDown }),
  toggleTopDownView: () => set((s) => ({ isTopDownView: !s.isTopDownView })),
  setScanConfig: (cfg) => set((s) => ({ scanConfig: { ...s.scanConfig, ...cfg } })),
  setSplatLoading: (loading) => set((s) => ({ splatLoading: { ...s.splatLoading, ...loading } })),
  setUserPosition: (pos) => set({ userPosition: pos }),
  setUserRotation: (yaw) => set({ userRotation: yaw }),
  setCameraPerspective: (p) => set({ cameraPerspective: p }),
  toggleCameraPerspective: () => set((s) => ({ cameraPerspective: s.cameraPerspective === 'follow' ? 'fpv' : 'follow' })),
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

  toggleAlignMode: () => set((s) => ({ isAlignMode: !s.isAlignMode })),
  setFloorPlanTransform: (t) => set((s) => ({ floorPlanTransform: { ...s.floorPlanTransform, ...t } })),
  setDynamicFloorPlan: (data) => set({ dynamicFloorPlan: data }),
  setShowLabels: (show) => set({ showLabels: show }),
  setQuality: (q) => set({ quality: q }),
  setAutoDpr: (dpr) => set({ autoDpr: dpr }),
  togglePerf: () => set((s) => ({ showPerf: !s.showPerf })),
  toggleCalibration: () => set((s) => ({ isCalibrationOpen: !s.isCalibrationOpen })),
  setIsCalibrationOpen: (open) => set({ isCalibrationOpen: open }),
  toggleSettings: () => set((s) => ({ isSettingsOpen: !s.isSettingsOpen })),
  setSelectedObject: (obj) => set({ selectedObject: obj }),
  setArrivalToast: (msg) => set({ arrivalToast: msg }),
  setFps: (fps) => set({ fps }),
}));
