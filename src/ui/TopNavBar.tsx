import React from 'react';
import { useStore } from '../state/useStore';
import { SearchBar } from './SearchBar';
import { ALL_POIS } from '../data/poiDatabase';
import { findPath } from '../navigation/astar';
import { generateTurnDirections } from '../navigation/turnByTurn';
import {
  Compass,
  Layers,
  Sparkles,
  AlertTriangle,
  Sliders,
  Box,
  Eye,
  Map,
} from 'lucide-react';

export const TopNavBar: React.FC = () => {
  const currentMode = useStore((s) => s.currentMode);
  const setCurrentMode = useStore((s) => s.setCurrentMode);
  const viewMode = useStore((s) => s.viewMode);
  const setViewMode = useStore((s) => s.setViewMode);
  const isTopDownView = useStore((s) => s.isTopDownView);
  const toggleTopDownView = useStore((s) => s.toggleTopDownView);
  const userPosition = useStore((s) => s.userPosition);
  const isEmergency = useStore((s) => s.isEmergency);
  const triggerEmergencyMode = useStore((s) => s.triggerEmergencyMode);
  const setDestination = useStore((s) => s.setDestination);
  const setNavigationRoute = useStore((s) => s.setNavigationRoute);
  const isAlignMode = useStore((s) => s.isAlignMode);
  const toggleAlignMode = useStore((s) => s.toggleAlignMode);

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
        
        {/* Brand & View Mode Switcher */}
        <div className="flex items-center gap-2 p-1.5 md:px-3 md:py-2 rounded-2xl bg-[rgba(15,17,20,0.7)] backdrop-blur-md border border-white/10 shadow-xl pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
              <Compass className="w-4 h-4" />
            </span>
            <div>
              <span className="text-sm font-extrabold text-white tracking-tight">
                Raasta <span className="text-cyan-400">3D</span>
              </span>
            </div>
          </div>

          <div className="h-5 w-px bg-white/10 mx-1 hidden sm:block" />

          {/* Top Switch: "3D Model" (default) | "Real Scan" */}
          <div className="flex items-center p-0.5 rounded-xl bg-black/40 border border-white/5">
            <button
              onClick={() => {
                setViewMode('mesh');
                if (currentMode === 'pipeline') setCurrentMode('roam');
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'mesh' && currentMode === 'roam'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D Model</span>
            </button>

            <button
              onClick={() => {
                setViewMode('splat');
                if (currentMode === 'pipeline') setCurrentMode('roam');
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'splat' && currentMode === 'roam'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real Scan</span>
            </button>
          </div>

          {/* Plan View Toggle (for mesh only) */}
          {viewMode === 'mesh' && (
            <button
              onClick={toggleTopDownView}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                isTopDownView
                  ? 'bg-slate-800 text-cyan-400 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
              title="Top-down architectural plan view (ceiling hidden)"
            >
              <Map className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{isTopDownView ? '1st Person' : 'Plan View'}</span>
            </button>
          )}
        </div>

        {/* Center Search Bar */}
        <div className="pointer-events-auto">
          <SearchBar />
        </div>

        {/* Right Action Controls: Align Floor Plan, Pipeline, Emergency */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Real Pipeline Screen Button */}
          <button
            onClick={() => setCurrentMode(currentMode === 'pipeline' ? 'roam' : 'pipeline')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold border transition-all ${
              currentMode === 'pipeline'
                ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-lg'
                : 'bg-[rgba(15,17,20,0.7)] backdrop-blur-md hover:bg-slate-800 text-slate-200 border-white/10'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Pipeline</span>
          </button>

          {/* Align Floor Plan Button */}
          <button
            onClick={toggleAlignMode}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold border transition-all ${
              isAlignMode
                ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                : 'bg-[rgba(15,17,20,0.7)] backdrop-blur-md hover:bg-slate-800 text-slate-200 border-white/10'
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
            title="Emergency Evacuation: route to Entrance"
          >
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="hidden sm:inline">Emergency</span>
          </button>
        </div>

      </div>
    </header>
  );
};
