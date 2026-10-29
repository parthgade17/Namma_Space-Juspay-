import React, { useMemo } from 'react';
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
  User,
  Eye,
} from 'lucide-react';

// Google Maps Style Animated Walking Man Icon with Moving Legs & Arms
const WalkingManIcon: React.FC<{ isWalking: boolean }> = ({ isWalking }) => (
  <svg
    viewBox="0 0 24 24"
    className="w-4 h-4 text-cyan-400 overflow-visible shrink-0"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Head */}
    <circle cx="12" cy="4" r="2.2" fill="currentColor" />
    {/* Torso */}
    <line x1="12" y1="6.5" x2="12" y2="12" />
    {/* Left Leg */}
    <g className={isWalking ? 'animate-walk-leg-left' : ''}>
      <path d="M12 12l-2.6 4.2-1.6 4.5" />
    </g>
    {/* Right Leg */}
    <g className={isWalking ? 'animate-walk-leg-right' : ''}>
      <path d="M12 12l2.6 4.2 1.6 4.5" />
    </g>
    {/* Arms counter-swing */}
    <g className={isWalking ? 'animate-walk-arms' : ''}>
      <path d="M7.5 9.5l4.5 1 4.5-1" />
    </g>
  </svg>
);

export const DirectionHUD: React.FC = () => {
  const activeDestination = useStore((s) => s.activeDestination);
  const activeTurnDirections = useStore((s) => s.activeTurnDirections);
  const totalPathDistance = useStore((s) => s.totalPathDistance);
  const estimatedTimeSeconds = useStore((s) => s.estimatedTimeSeconds);
  const isAutoWalking = useStore((s) => s.isAutoWalking);
  const setIsAutoWalking = useStore((s) => s.setIsAutoWalking);
  const clearNavigation = useStore((s) => s.clearNavigation);
  const isEmergency = useStore((s) => s.isEmergency);
  const userPosition = useStore((s) => s.userPosition);
  const activePath = useStore((s) => s.activePath);
  const cameraPerspective = useStore((s) => s.cameraPerspective);
  const toggleCameraPerspective = useStore((s) => s.toggleCameraPerspective);

  // Real-time dynamic distance & estimated time countdown matching real walking speed
  const { liveRemainingDistance, liveRemainingSeconds } = useMemo(() => {
    if (activePath.length < 2) {
      return { liveRemainingDistance: totalPathDistance, liveRemainingSeconds: estimatedTimeSeconds };
    }

    // Find nearest segment index on activePath to current userPosition
    let closestIndex = 0;
    let minD = Infinity;
    for (let i = 0; i < activePath.length; i++) {
      const d = Math.hypot(userPosition[0] - activePath[i][0], userPosition[2] - activePath[i][2]);
      if (d < minD) {
        minD = d;
        closestIndex = i;
      }
    }

    // Accumulate metric distance along remaining segments
    let remDist = Math.hypot(userPosition[0] - activePath[closestIndex][0], userPosition[2] - activePath[closestIndex][2]);
    for (let i = closestIndex; i < activePath.length - 1; i++) {
      remDist += Math.hypot(activePath[i + 1][0] - activePath[i][0], activePath[i + 1][2] - activePath[i][2]);
    }

    const roundedDist = Math.max(0.1, Math.round(remDist * 10) / 10);
    const roundedSec = Math.max(1, Math.ceil(roundedDist / 1.45));
    return { liveRemainingDistance: roundedDist, liveRemainingSeconds: roundedSec };
  }, [userPosition, activePath, totalPathDistance, estimatedTimeSeconds]);

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

  // 1. COLLAPSED WALKING PILL WHILE ACTIVELY WALKING (RESPONSIVE TOP DOCK)
  if (isAutoWalking) {
    return (
      <div className="fixed top-28 sm:top-24 left-1/2 -translate-x-1/2 z-30 select-none pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-150 max-w-[95vw]">
        <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[rgba(15,17,20,0.85)] backdrop-blur-xl border border-cyan-500/40 shadow-2xl shadow-cyan-500/10 text-xs">
          
          {/* Animated Walking Man Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-bold shrink-0">
            <WalkingManIcon isWalking={true} />
            <span className="text-[10px] sm:text-[11px] tracking-wide uppercase">WALKING</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping ml-0.5" />
          </div>

          <div className="flex items-center gap-1 text-white font-semibold text-xs min-w-0">
            <span className="hidden xs:inline text-slate-400">to</span>
            <span className="text-cyan-400 font-bold truncate max-w-[85px] xs:max-w-[120px] sm:max-w-[150px]">
              {activeDestination.name}
            </span>
          </div>

          {/* Dynamic real-time ticking distance & time */}
          <div className="flex items-center gap-1 sm:gap-1.5 font-mono text-[10px] sm:text-[11px] text-slate-300 bg-black/40 px-2 py-0.5 rounded-lg border border-white/5 shrink-0">
            <span className="text-cyan-400 font-bold">{liveRemainingDistance}m</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-200">{liveRemainingSeconds}s</span>
          </div>

          {/* Perspective Switcher Button: 3D Follow vs FPV Eye View */}
          <button
            onClick={toggleCameraPerspective}
            className={`flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] transition-all cursor-pointer shrink-0 ${
              cameraPerspective === 'follow'
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
            title={cameraPerspective === 'follow' ? 'Viewing 3D Walking Man (Click for Eye View)' : 'Viewing Eye Level (Click for 3D Follow)'}
          >
            {cameraPerspective === 'follow' ? (
              <>
                <User className="w-3 h-3 text-cyan-400" />
                <span className="hidden sm:inline">3D Man</span>
              </>
            ) : (
              <>
                <Eye className="w-3 h-3 text-slate-300" />
                <span className="hidden sm:inline">FPV</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsAutoWalking(false)}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] sm:text-[11px] transition-all ml-0.5 cursor-pointer shadow shrink-0"
          >
            <Square className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-slate-950" />
            <span>Pause</span>
          </button>
        </div>
      </div>
    );
  }

  // 2. COMPACT ROUTE CARD (RESPONSIVE: DOCKS BOTTOM-16 ON MOBILE, TOP-LEFT ON DESKTOP)
  return (
    <div className="fixed bottom-16 sm:bottom-auto sm:top-24 left-3 right-3 sm:left-4 sm:right-auto sm:w-84 max-w-sm mx-auto sm:mx-0 z-30 select-none pointer-events-auto animate-in fade-in slide-in-from-bottom sm:slide-in-from-left duration-200">
      <div
        className={`rounded-2xl p-3.5 sm:p-4 shadow-2xl border transition-all ${
          isEmergency
            ? 'bg-[rgba(35,12,16,0.9)] border-red-500/40 backdrop-blur-xl'
            : 'bg-[rgba(15,17,20,0.85)] border-white/10 backdrop-blur-xl'
        }`}
      >
        {/* Destination Header */}
        <div className="flex items-start justify-between pb-2 border-b border-white/10">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
              {isEmergency ? (
                <span className="flex items-center gap-1 text-red-400">
                  <AlertTriangle className="w-3 h-3" /> Evacuation Route
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <WalkingManIcon isWalking={false} />
                  <span>Google Maps Indoor Route</span>
                </span>
              )}
            </div>
            <h2 className="text-sm sm:text-base font-bold text-white mt-0.5 truncate max-w-[200px] sm:max-w-[220px]">
              {activeDestination.name}
            </h2>
            <p className="text-[11px] text-slate-400 truncate">{activeDestination.roomName}</p>
          </div>

          <div className="flex items-center gap-1">
            {/* View Mode Toggle: 3D Follow vs FPV */}
            <button
              onClick={toggleCameraPerspective}
              className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                cameraPerspective === 'follow'
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
              title={cameraPerspective === 'follow' ? '3D Follow View (Showing Walking Man)' : 'First-Person View'}
            >
              {cameraPerspective === 'follow' ? <User className="w-3.5 h-3.5 text-cyan-400" /> : <Eye className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={clearNavigation}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Cancel route"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Next Turn Instruction with Direction Icon */}
        <div className="flex items-center gap-2.5 my-2.5 p-2 rounded-xl bg-black/40 border border-white/5">
          <div className="p-2 rounded-lg bg-cyan-500/15 border border-cyan-500/30 shrink-0">
            {getStepIcon(currentStep?.icon || 'straight')}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-white leading-snug truncate">
              {currentStep?.instruction}
            </div>
            {currentStep?.distance > 0 && (
              <div className="text-[10px] text-cyan-400 font-mono">
                {liveRemainingDistance} m remaining
              </div>
            )}
          </div>
        </div>

        {/* Telemetry & Big Start Button */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center gap-2.5 sm:gap-3 text-xs font-mono">
            <div>
              <span className="text-[9px] sm:text-[10px] text-slate-400 block uppercase">Dist</span>
              <span className="text-cyan-400 font-bold text-xs">{liveRemainingDistance}m</span>
            </div>
            <div className="h-4 sm:h-5 w-px bg-white/10" />
            <div>
              <span className="text-[9px] sm:text-[10px] text-slate-400 block uppercase">Time</span>
              <span className="text-slate-200 font-bold text-xs flex items-center gap-1">
                <Clock className="w-3 h-3 text-cyan-400" />
                {liveRemainingSeconds}s
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsAutoWalking(true)}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" />
            <span>Start Walking</span>
          </button>
        </div>
      </div>
    </div>
  );
};
