import React, { useState } from 'react';
import { useStore } from '../state/useStore';
import { SearchBar } from './SearchBar';
import { ModelUploadModal } from './ModelUploadModal';
import { ALL_POIS } from '../data/poiDatabase';
import { findPath } from '../navigation/astar';
import { generateTurnDirections } from '../navigation/turnByTurn';
import { exportSceneToGLB } from '../scene/SceneExporter';
import { useThree } from '@react-three/fiber';
import {
  Compass,
  Eye,
  Camera,
  Layers,
  Upload,
  Download,
  AlertTriangle,
  PlayCircle,
  HelpCircle,
} from 'lucide-react';

interface Props {
  sceneRef?: React.MutableRefObject<any>;
}

export const TopNavBar: React.FC<Props> = ({ sceneRef }) => {
  const currentMode = useStore((s) => s.currentMode);
  const setCurrentMode = useStore((s) => s.setCurrentMode);
  const cameraMode = useStore((s) => s.cameraMode);
  const setCameraMode = useStore((s) => s.setCameraMode);
  const userPosition = useStore((s) => s.userPosition);
  const isEmergency = useStore((s) => s.isEmergency);
  const triggerEmergencyMode = useStore((s) => s.triggerEmergencyMode);
  const setDestination = useStore((s) => s.setDestination);
  const setNavigationRoute = useStore((s) => s.setNavigationRoute);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Trigger Emergency Evacuation: finds nearest exit
  const handleEmergencyEvacuation = () => {
    triggerEmergencyMode();

    // Find closest exit to user
    const exits = ALL_POIS.filter((p) => p.category === 'exit' || p.isEmergency);
    let nearestExit = exits[0];
    let minDistance = Infinity;

    for (const exit of exits) {
      const dist = Math.hypot(
        userPosition[0] - exit.position[0],
        userPosition[2] - exit.position[2]
      );
      if (dist < minDistance) {
        minDistance = dist;
        nearestExit = exit;
      }
    }

    if (nearestExit) {
      setDestination(nearestExit);
      const path = findPath(
        userPosition[0],
        userPosition[2],
        nearestExit.position[0],
        nearestExit.position[2]
      );
      if (path.length >= 2) {
        const { directions, totalDistance } = generateTurnDirections(path, nearestExit);
        setNavigationRoute(path, directions, totalDistance);
      }
    }
  };

  const handleExportGLB = () => {
    if (sceneRef?.current) {
      exportSceneToGLB(sceneRef.current, 'raasta3d_digital_twin.glb');
    } else {
      alert('Preparing 3D scene geometry for GLB export...');
    }
  };

  return (
    <>
      <header className="absolute top-0 left-0 right-0 z-30 p-3 md:p-4 pointer-events-none select-none">
        <div className="flex flex-wrap items-center justify-between gap-3 max-w-7xl mx-auto">
          
          {/* Logo & Platform Info */}
          <div className="flex items-center gap-3 glass-panel rounded-2xl p-1.5 md:px-3.5 md:py-2 border border-slate-700/60 shadow-xl pointer-events-auto">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                <Compass className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm md:text-base font-extrabold text-white tracking-tight">
                    Raasta <span className="text-emerald-400">3D</span>
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hidden sm:inline">
                    IIT Bombay
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 hidden md:block">
                  Indoor Spatial Engine & Twin
                </div>
              </div>
            </div>

            {/* Mode Switcher: Pipeline vs Roam */}
            <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block" />

            <div className="flex items-center bg-slate-950/80 p-0.5 rounded-xl border border-slate-800">
              <button
                onClick={() => setCurrentMode('roam')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  currentMode === 'roam'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>3D Walk</span>
              </button>

              <button
                onClick={() => setCurrentMode('pipeline')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  currentMode === 'pipeline'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Scan Pipeline</span>
              </button>
            </div>
          </div>

          {/* Center Search Bar */}
          <div className="pointer-events-auto">
            <SearchBar />
          </div>

          {/* Right Action Controls: Camera Mode, Upload, Emergency */}
          <div className="flex items-center gap-2 pointer-events-auto">
            
            {/* Camera Mode Toggle (Dollhouse vs First Person) */}
            <div className="glass-panel p-1 rounded-2xl border border-slate-700/60 flex items-center shadow-lg">
              <button
                onClick={() => setCameraMode('orbit')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  cameraMode === 'orbit'
                    ? 'bg-slate-800 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Dollhouse isometric view"
              >
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Dollhouse</span>
              </button>

              <button
                onClick={() => setCameraMode('fps')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  cameraMode === 'fps'
                    ? 'bg-emerald-500 text-slate-950 shadow font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="First-person walkable view (WASD)"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>1st Person</span>
              </button>
            </div>

            {/* Load Model Button */}
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl glass-panel hover:bg-slate-800/80 text-xs font-semibold text-slate-200 border border-slate-700/60 shadow-lg transition-all"
              title="Upload your own scanned .glb/.ply model"
            >
              <Upload className="w-4 h-4 text-emerald-400" />
              <span className="hidden lg:inline">Load Scan</span>
            </button>

            {/* Export GLB Button */}
            <button
              onClick={handleExportGLB}
              className="p-2 rounded-2xl glass-panel hover:bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700/60 shadow-lg transition-all"
              title="Export current scene to .glb"
            >
              <Download className="w-4 h-4 text-cyan-400" />
            </button>

            {/* Emergency Evacuation Mode Button */}
            <button
              onClick={handleEmergencyEvacuation}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shadow-lg ${
                isEmergency
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300'
              }`}
              title="Emergency Evacuation: find nearest exit"
            >
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="hidden sm:inline">Emergency</span>
            </button>

          </div>

        </div>
      </header>

      {/* Model Upload Modal */}
      <ModelUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </>
  );
};
