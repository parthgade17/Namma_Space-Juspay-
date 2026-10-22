import React from 'react';
import { useStore } from '../state/useStore';
import { SearchBar } from './SearchBar';
import { ALL_POIS } from '../data/poiDatabase';
import { findPath } from '../navigation/astar';
import { generateTurnDirections } from '../navigation/turnByTurn';
import {
  Compass,
  Layers,
  AlertTriangle,
  Sliders,
  Sparkles,
} from 'lucide-react';

export const TopNavBar: React.FC = () => {
  const currentMode = useStore((s) => s.currentMode);
  const setCurrentMode = useStore((s) => s.setCurrentMode);
  const userPosition = useStore((s) => s.userPosition);
  const isEmergency = useStore((s) => s.isEmergency);
  const triggerEmergencyMode = useStore((s) => s.triggerEmergencyMode);
  const setDestination = useStore((s) => s.setDestination);
  const setNavigationRoute = useStore((s) => s.setNavigationRoute);
  const isAlignMode = useStore((s) => s.isAlignMode);
  const toggleAlignMode = useStore((s) => s.toggleAlignMode);

  // Trigger Emergency Evacuation
  const handleEmergencyEvacuation = () => {
    triggerEmergencyMode();

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

  return (
    <header className="absolute top-0 left-0 right-0 z-30 p-3 md:p-4 pointer-events-none select-none">
      <div className="flex flex-wrap items-center justify-between gap-3 max-w-7xl mx-auto">
        
        {/* Brand & View Mode */}
        <div className="flex items-center gap-3 p-1.5 md:px-3 md:py-2 rounded-2xl bg-[rgba(15,17,20,0.6)] backdrop-blur-md border border-white/10 shadow-xl pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
              <Compass className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold text-white tracking-tight">
                  Raasta <span className="text-cyan-400">3D</span>
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hidden sm:inline">
                  Real Gaussian Splat
                </span>
              </div>
            </div>
          </div>

          <div className="h-5 w-px bg-white/10 mx-1 hidden sm:block" />

          {/* Pipeline Button */}
          <button
            onClick={() => setCurrentMode(currentMode === 'pipeline' ? 'roam' : 'pipeline')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              currentMode === 'pipeline'
                ? 'bg-cyan-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Real Pipeline</span>
          </button>
        </div>

        {/* Center Search Bar */}
        <div className="pointer-events-auto">
          <SearchBar />
        </div>

        {/* Right Action Controls: Align Floor Plan & Emergency */}
        <div className="flex items-center gap-2 pointer-events-auto">
          
          {/* Align Floor Plan Button */}
          <button
            onClick={toggleAlignMode}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold border transition-all ${
              isAlignMode
                ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                : 'bg-[rgba(15,17,20,0.6)] backdrop-blur-md hover:bg-slate-800 text-slate-200 border-white/10'
            }`}
            title="Align floor plan orthographic view"
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Align Plan</span>
          </button>

          {/* Emergency Evacuation Mode Button */}
          <button
            onClick={handleEmergencyEvacuation}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shadow-lg ${
              isEmergency
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300'
            }`}
            title="Emergency Evacuation"
          >
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="hidden sm:inline">Emergency</span>
          </button>

        </div>

      </div>
    </header>
  );
};
