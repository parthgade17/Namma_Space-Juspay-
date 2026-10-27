import React from 'react';
import { useStore } from '../state/useStore';
import { SearchBar } from './SearchBar';
import { ALL_POIS } from '../data/poiDatabase';
import { findPath } from '../navigation/astar';
import { generateTurnDirections } from '../navigation/turnByTurn';
import {
  Compass,
  AlertTriangle,
  Box,
  Sparkles,
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

  const destinationChips = [
    { label: 'Workshop', query: 'Workshop' },
    { label: 'Electronics', query: 'Electronics' },
    { label: '3D Printers', query: '3D Printer' },
    { label: 'Laser Cutter', query: 'Laser Cutter' },
    { label: 'Meeting Room', query: 'Meeting Room' },
    { label: 'Exit', query: 'Entrance' },
  ];

  const handleChipClick = (label: string, query: string) => {
    const target = ALL_POIS.find(
      (p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.roomName.toLowerCase().includes(query.toLowerCase())
    );

    if (target) {
      setDestination(target);
      const path = findPath(
        userPosition[0],
        userPosition[2],
        target.position[0],
        target.position[2]
      );
      if (path.length >= 2) {
        const { directions, totalDistance } = generateTurnDirections(path, target);
        setNavigationRoute(path, directions, totalDistance);
      }
    }
  };

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
    <header className="absolute top-0 left-0 right-0 z-30 p-2 sm:p-4 pointer-events-none select-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-start md:justify-between gap-2 md:gap-3">
        
        {/* Mobile Tier 1 / Desktop Left: Logo + View Switcher & (on mobile) Emergency Button */}
        <div className="flex items-center justify-between w-full md:w-auto gap-2">
          
          {/* Logo & View Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-2xl bg-[rgba(15,17,20,0.7)] backdrop-blur-md border border-white/10 shadow-xl pointer-events-auto shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="p-1 sm:p-1.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
                <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-white tracking-tight">
                Raasta<span className="text-cyan-400">3D</span>
              </span>
            </div>

            <div className="h-4 sm:h-5 w-px bg-white/10 mx-0.5 sm:mx-1" />

            {/* View Mode Switcher: 3D Model | Real Scan | Plan */}
            <div className="flex items-center p-0.5 rounded-xl bg-black/40 border border-white/5 text-[11px] sm:text-xs font-semibold">
              {/* 3D Model */}
              <button
                onClick={() => {
                  setViewMode('mesh');
                  if (isTopDownView) toggleTopDownView();
                  if (currentMode === 'pipeline') setCurrentMode('roam');
                }}
                className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg transition-all ${
                  viewMode === 'mesh' && !isTopDownView && currentMode === 'roam'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Box className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>3D</span>
              </button>

              {/* Real Scan */}
              <button
                onClick={() => {
                  setViewMode('splat');
                  if (isTopDownView) toggleTopDownView();
                  if (currentMode === 'pipeline') setCurrentMode('roam');
                }}
                className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg transition-all ${
                  viewMode === 'splat' && currentMode === 'roam'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Scan</span>
              </button>

              {/* Plan View */}
              <button
                onClick={() => {
                  if (viewMode !== 'mesh') setViewMode('mesh');
                  toggleTopDownView();
                }}
                className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg transition-all ${
                  isTopDownView
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Map className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Plan</span>
              </button>
            </div>
          </div>

          {/* Emergency Button (Mobile Viewport: placed in top row next to view switcher) */}
          <div className="md:hidden pointer-events-auto shrink-0">
            <button
              onClick={handleEmergencyEvacuation}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-lg ${
                isEmergency
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300'
              }`}
              title="Emergency Evacuation: route to Entrance"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span>SOS</span>
            </button>
          </div>

        </div>

        {/* Center: Search Bar + Destination Chips */}
        <div className="flex flex-col items-center gap-1.5 pointer-events-auto w-full md:max-w-md">
          <SearchBar />

          {/* Quick Destination Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full w-full px-1 py-0.5 no-scrollbar touch-pan-x justify-start sm:justify-center">
            {destinationChips.map((chip) => (
              <button
                key={chip.label}
                onClick={() => handleChipClick(chip.label, chip.query)}
                className="px-2.5 py-1 rounded-full bg-[rgba(15,17,20,0.7)] hover:bg-slate-800 backdrop-blur-md border border-white/10 text-[11px] text-slate-300 hover:text-cyan-400 hover:border-cyan-400/40 transition-all whitespace-nowrap cursor-pointer shadow shrink-0"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Right: Emergency Evacuation Button */}
        <div className="hidden md:block pointer-events-auto shrink-0">
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
            <span>Emergency</span>
          </button>
        </div>

      </div>
    </header>
  );
};
