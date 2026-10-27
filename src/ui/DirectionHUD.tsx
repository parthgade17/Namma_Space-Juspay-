import React from 'react';
import { useStore } from '../state/useStore';
import {
  Navigation,
  CornerUpLeft,
  CornerUpRight,
  ArrowUp,
  MapPin,
  Play,
  Square,
  Clock,
  X,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';

export const DirectionHUD: React.FC = () => {
  const activeDestination = useStore((s) => s.activeDestination);
  const activeTurnDirections = useStore((s) => s.activeTurnDirections);
  const totalPathDistance = useStore((s) => s.totalPathDistance);
  const estimatedTimeSeconds = useStore((s) => s.estimatedTimeSeconds);
  const isAutoWalking = useStore((s) => s.isAutoWalking);
  const setIsAutoWalking = useStore((s) => s.setIsAutoWalking);
  const clearNavigation = useStore((s) => s.clearNavigation);
  const isEmergency = useStore((s) => s.isEmergency);

  if (!activeDestination || activeTurnDirections.length === 0) return null;

  const currentStep = activeTurnDirections[0];

  const getStepIcon = (icon: 'straight' | 'left' | 'right' | 'arrival') => {
    switch (icon) {
      case 'left':
        return <CornerUpLeft className="w-4 h-4 text-cyan-400" />;
      case 'right':
        return <CornerUpRight className="w-4 h-4 text-cyan-400" />;
      case 'arrival':
        return <MapPin className="w-4 h-4 text-cyan-400" />;
      default:
        return <ArrowUp className="w-4 h-4 text-cyan-400" />;
    }
  };

  // 1. COLLAPSED WALKING PILL WHILE WALKING
  if (isAutoWalking) {
    return (
      <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 select-none pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-150">
        <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-[rgba(15,17,20,0.75)] backdrop-blur-md border border-cyan-500/30 shadow-xl text-xs">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Walking to {activeDestination.name}</span>
          </div>
          <span className="text-slate-400 font-mono text-[11px]">• {totalPathDistance}m • {estimatedTimeSeconds}s</span>
          <button
            onClick={() => setIsAutoWalking(false)}
            className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] transition-all ml-1"
          >
            <Square className="w-3 h-3 fill-slate-950" /> Pause
          </button>
        </div>
      </div>
    );
  }

  // 2. COMPACT ROUTE CARD (GOOGLE MAPS STYLE)
  return (
    <div className="absolute top-24 left-4 z-30 w-80 md:w-84 select-none pointer-events-auto animate-in fade-in slide-in-from-left duration-200">
      <div
        className={`rounded-2xl p-4 shadow-2xl border transition-all ${
          isEmergency
            ? 'bg-[rgba(35,12,16,0.85)] border-red-500/40 backdrop-blur-md'
            : 'bg-[rgba(15,17,20,0.7)] border-white/10 backdrop-blur-md'
        }`}
      >
        {/* Destination Header */}
        <div className="flex items-start justify-between pb-2.5 border-b border-white/10">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
              {isEmergency ? (
                <span className="flex items-center gap-1 text-red-400">
                  <AlertTriangle className="w-3 h-3" /> Evacuation Route
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Navigation className="w-3 h-3 text-cyan-400" /> Destination
                </span>
              )}
            </div>
            <h2 className="text-sm md:text-base font-bold text-white mt-0.5 truncate max-w-[210px]">
              {activeDestination.name}
            </h2>
            <p className="text-[11px] text-slate-400 truncate">{activeDestination.roomName}</p>
          </div>

          <button
            onClick={clearNavigation}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Cancel route"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Next Turn Instruction with Direction Icon */}
        <div className="flex items-center gap-2.5 my-3 p-2.5 rounded-xl bg-black/40 border border-white/5">
          <div className="p-2 rounded-lg bg-cyan-500/15 border border-cyan-500/30 shrink-0">
            {getStepIcon(currentStep?.icon || 'straight')}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-white leading-snug truncate">
              {currentStep?.instruction}
            </div>
            {currentStep?.distance > 0 && (
              <div className="text-[10px] text-cyan-400 font-mono">
                {currentStep.distance} m ahead
              </div>
            )}
          </div>
        </div>

        {/* Telemetry & Big Start Button */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Dist</span>
              <span className="text-cyan-400 font-bold text-xs">{totalPathDistance}m</span>
            </div>
            <div className="h-5 w-px bg-white/10" />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Time</span>
              <span className="text-slate-200 font-bold text-xs flex items-center gap-1">
                <Clock className="w-3 h-3 text-cyan-400" />
                {estimatedTimeSeconds}s
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsAutoWalking(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 hover:scale-105 transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" />
            Start
          </button>
        </div>
      </div>
    </div>
  );
};
