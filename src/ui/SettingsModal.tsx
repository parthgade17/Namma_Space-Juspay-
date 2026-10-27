import React from 'react';
import { useStore } from '../state/useStore';
import { X, SlidersHorizontal, Activity, Tag, Sliders, Layers, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const quality = useStore((s) => s.quality);
  const setQuality = useStore((s) => s.setQuality);
  const showLabels = useStore((s) => s.showLabels);
  const setShowLabels = useStore((s) => s.setShowLabels);
  const showPerf = useStore((s) => s.showPerf);
  const togglePerf = useStore((s) => s.togglePerf);
  const isAlignMode = useStore((s) => s.isAlignMode);
  const toggleAlignMode = useStore((s) => s.toggleAlignMode);
  const currentMode = useStore((s) => s.currentMode);
  const setCurrentMode = useStore((s) => s.setCurrentMode);
  const toggleCalibration = useStore((s) => s.toggleCalibration);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-2xl bg-[rgba(15,17,20,0.9)] backdrop-blur-xl border border-white/10 shadow-2xl p-5 text-slate-100 flex flex-col gap-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white tracking-tight">Settings & Engine Options</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quality Controls */}
        <div className="space-y-1.5">
          <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block">
            Rendering Quality
          </span>
          <div className="grid grid-cols-4 gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
            {(['auto', 'high', 'balanced', 'low'] as const).map((q) => (
              <button
                key={q}
                onClick={() => setQuality(q)}
                className={`py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                  quality === q
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Option Toggles */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          
          {/* Labels Toggle */}
          <button
            onClick={() => setShowLabels(!showLabels)}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-xs font-medium cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-cyan-400" />
              <span>3D Room & Equipment Labels</span>
            </span>
            <span className={`font-mono text-[11px] font-bold ${showLabels ? 'text-cyan-400' : 'text-slate-500'}`}>
              {showLabels ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Profiler / r3f-perf Toggle */}
          <button
            onClick={togglePerf}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-xs font-medium cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Performance Profiler (r3f-perf)</span>
            </span>
            <span className={`font-mono text-[11px] font-bold ${showPerf ? 'text-emerald-400' : 'text-slate-500'}`}>
              {showPerf ? 'ACTIVE' : 'OFF'}
            </span>
          </button>

          {/* Align Plan Mode */}
          <button
            onClick={() => {
              toggleAlignMode();
              onClose();
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-xs font-medium cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-yellow-400" />
              <span>Align Floor Plan with Scan</span>
            </span>
            <span className={`font-mono text-[11px] font-bold ${isAlignMode ? 'text-yellow-400' : 'text-slate-500'}`}>
              {isAlignMode ? 'ACTIVE' : 'OPEN'}
            </span>
          </button>

          {/* Reconstruction Pipeline Modal */}
          <button
            onClick={() => {
              setCurrentMode(currentMode === 'pipeline' ? 'roam' : 'pipeline');
              onClose();
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-xs font-medium cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>COLMAP & Splat Pipeline Details</span>
            </span>
            <span className="font-mono text-[11px] text-purple-400 font-bold">VIEW</span>
          </button>

        </div>

      </div>
    </div>
  );
};
