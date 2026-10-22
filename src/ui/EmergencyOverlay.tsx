import React from 'react';
import { useStore } from '../state/useStore';
import { AlertOctagon, ShieldAlert, X } from 'lucide-react';

export const EmergencyOverlay: React.FC = () => {
  const isEmergency = useStore((s) => s.isEmergency);
  const resetEmergencyMode = useStore((s) => s.resetEmergencyMode);
  const clearNavigation = useStore((s) => s.clearNavigation);

  if (!isEmergency) return null;

  const handleDismiss = () => {
    resetEmergencyMode();
    clearNavigation();
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-40 pointer-events-none">
      {/* Pulsing red emergency alert stripe */}
      <div className="bg-red-600/90 text-white backdrop-blur-md px-4 py-2 border-b border-red-500 shadow-2xl flex items-center justify-between pointer-events-auto animate-pulse">
        <div className="flex items-center gap-3">
          <div className="p-1 rounded-full bg-white text-red-600">
            <AlertOctagon className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <div className="text-xs md:text-sm font-extrabold uppercase tracking-widest">
              Emergency Evacuation Activated
            </div>
            <div className="text-[11px] text-red-100">
              Optimal non-colliding route mapped to nearest Fire Exit. Follow glowing red path immediately.
            </div>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-800/80 hover:bg-red-700 text-xs font-bold text-white transition-colors"
        >
          <X className="w-4 h-4" />
          Dismiss Alarm
        </button>
      </div>

      {/* Screen edge emergency vignette */}
      <div className="fixed inset-0 border-4 border-red-600/60 pointer-events-none shadow-[inset_0_0_50px_rgba(239,68,68,0.5)]" />
    </div>
  );
};
