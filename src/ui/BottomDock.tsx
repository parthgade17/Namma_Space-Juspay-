import React, { useState, useEffect } from 'react';
import { useStore } from '../state/useStore';
import { MapPin, Compass, Settings, HelpCircle, Play } from 'lucide-react';
import { DestinationsDrawer } from './DestinationsDrawer';
import { SettingsModal } from './SettingsModal';
import { HelpModal } from './HelpModal';
import { ALL_POIS } from '../data/poiDatabase';
import { findPath } from '../navigation/astar';
import { generateTurnDirections } from '../navigation/turnByTurn';

export const BottomDock: React.FC = () => {
  const [isDestinationsOpen, setIsDestinationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const userPosition = useStore((s) => s.userPosition);
  const setDestination = useStore((s) => s.setDestination);
  const setNavigationRoute = useStore((s) => s.setNavigationRoute);
  const setIsAutoWalking = useStore((s) => s.setIsAutoWalking);
  const isAutoWalking = useStore((s) => s.isAutoWalking);

  // Global Keyboard shortcuts: F (search), T (tour), H (help)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 't' || e.key === 'T') {
        handleStartTour();
      } else if (e.key === 'h' || e.key === 'H') {
        setIsHelpOpen((prev) => !prev);
      } else if (e.key === 'f' || e.key === 'F') {
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [userPosition]);

  const handleStartTour = () => {
    // Tour sequence: Workshop -> Electronics -> 3D Printers -> Laser Cutter -> Meeting Room
    const target = ALL_POIS.find((p) => p.name.includes('Workshop') || p.roomName.includes('Workshop')) || ALL_POIS[0];
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
        setIsAutoWalking(true);
      }
    }
  };

  return (
    <>
      <div className="fixed bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 select-none pointer-events-auto max-w-[95vw]">
        <div className="flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-2xl bg-[rgba(15,17,20,0.8)] backdrop-blur-xl border border-white/10 shadow-2xl">
          
          {/* Destinations */}
          <button
            onClick={() => setIsDestinationsOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer group"
            title="Browse all lab destinations (F to search)"
          >
            <MapPin className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Destinations</span>
          </button>

          <div className="h-4 w-px bg-white/10" />

          {/* Guided Tour */}
          <button
            onClick={handleStartTour}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold active:scale-95 transition-all cursor-pointer group ${
              isAutoWalking
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
            title="Start automated guided tour (Hotkey: T)"
          >
            <Compass className="w-4 h-4 text-emerald-400 group-hover:rotate-45 transition-transform" />
            <span className="hidden sm:inline">Tour</span>
            <span className="text-[10px] text-slate-500 font-mono hidden md:inline">[T]</span>
          </button>

          <div className="h-4 w-px bg-white/10" />

          {/* Settings */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer group"
            title="Quality, profiler, and alignment settings"
          >
            <Settings className="w-4 h-4 text-yellow-400 group-hover:rotate-90 transition-transform" />
            <span className="hidden sm:inline">Settings</span>
          </button>

          <div className="h-4 w-px bg-white/10" />

          {/* Help */}
          <button
            onClick={() => setIsHelpOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer group"
            title="Controls & keyboard guide (Hotkey: H)"
          >
            <HelpCircle className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Help</span>
            <span className="text-[10px] text-slate-500 font-mono hidden md:inline">[H]</span>
          </button>

        </div>
      </div>

      {/* Modals */}
      <DestinationsDrawer
        isOpen={isDestinationsOpen}
        onClose={() => setIsDestinationsOpen(false)}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </>
  );
};
