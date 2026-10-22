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
  const nextSteps = activeTurnDirections.slice(1);

  const getStepIcon = (icon: 'straight' | 'left' | 'right' | 'arrival') => {
    switch (icon) {
      case 'left':
        return <CornerUpLeft className="w-5 h-5 text-cyan-400" />;
      case 'right':
        return <CornerUpRight className="w-5 h-5 text-cyan-400" />;
      case 'arrival':
        return <MapPin className="w-5 h-5 text-cyan-400" />;
      default:
        return <ArrowUp className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="absolute top-20 left-4 z-30 w-80 md:w-96 select-none pointer-events-auto animate-in fade-in slide-in-from-left duration-200">
      <div
        className={`rounded-2xl p-4 shadow-2xl border transition-all ${
          isEmergency
            ? 'bg-[rgba(45,15,20,0.9)] border-red-500/40 backdrop-blur-xl'
            : 'bg-[rgba(15,17,20,0.85)] border-white/10 backdrop-blur-xl'
        }`}
      >
        {/* Destination Header */}
        <div className="flex items-start justify-between pb-3 border-b border-white/10">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">
              {isEmergency ? (
                <span className="flex items-center gap-1 text-red-400 font-bold">
                  <AlertTriangle className="w-3.5 h-3.5" /> Emergency Evacuation Path
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5 text-cyan-400" /> Navigating to
                </span>
              )}
            </div>
            <h2 className="text-base font-bold text-white mt-0.5 truncate max-w-[230px]">
              {activeDestination.name}
            </h2>
            <p className="text-xs text-slate-400 truncate">{activeDestination.roomName}</p>
          </div>

          <button
            onClick={clearNavigation}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Cancel navigation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Turn Direction Card */}
        <div className="flex items-center gap-3.5 my-3.5 p-3 rounded-xl bg-black/40 border border-white/5">
          <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 shrink-0">
            {getStepIcon(currentStep?.icon || 'straight')}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs md:text-sm font-semibold text-white leading-snug">
              {currentStep?.instruction}
            </div>
            {currentStep?.distance > 0 && (
              <div className="text-[11px] text-cyan-400 font-mono mt-0.5">
                In next {currentStep.distance} meters
              </div>
            )}
          </div>
        </div>

        {/* Upcoming turns list preview */}
        {nextSteps.length > 0 && (
          <div className="space-y-1 mb-3.5 max-h-24 overflow-y-auto pr-1">
            {nextSteps.map((step, idx) => (
              <div
                key={step.id || idx}
                className="flex items-center gap-2 text-[11px] text-slate-400 py-0.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                <span className="truncate flex-1">{step.instruction}</span>
                {step.distance > 0 && (
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">
                    {step.distance}m
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Telemetry Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div className="flex items-center gap-3 text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Distance</span>
              <span className="text-cyan-400 font-bold">{totalPathDistance} m</span>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Est. Walk</span>
              <span className="text-slate-300 font-bold flex items-center gap-1">
                <Clock className="w-3 h-3 text-cyan-400" />
                {estimatedTimeSeconds} s
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsAutoWalking(!isAutoWalking)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all shadow-lg ${
              isAutoWalking
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 animate-pulse'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/25'
            }`}
          >
            {isAutoWalking ? (
              <>
                <Square className="w-3.5 h-3.5 fill-slate-950" />
                Pause Walk
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                Auto-Walk
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
