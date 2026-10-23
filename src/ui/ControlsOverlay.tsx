import React, { useState, useEffect } from 'react';
import { useStore } from '../state/useStore';
import {
  Activity,
  SlidersHorizontal,
  Tag,
  Maximize2,
  Sliders,
  Map,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const ControlsOverlay: React.FC = () => {
  const viewMode = useStore((s) => s.viewMode);
  const showLabels = useStore((s) => s.showLabels);
  const setShowLabels = useStore((s) => s.setShowLabels);
  const quality = useStore((s) => s.quality);
  const setQuality = useStore((s) => s.setQuality);
  const isCalibrationOpen = useStore((s) => s.isCalibrationOpen);
  const toggleCalibration = useStore((s) => s.toggleCalibration);
  const isAlignMode = useStore((s) => s.isAlignMode);
  const toggleAlignMode = useStore((s) => s.toggleAlignMode);
  const isTopDownView = useStore((s) => s.isTopDownView);
  const toggleTopDownView = useStore((s) => s.toggleTopDownView);
  const fps = useStore((s) => s.fps);
  const setFps = useStore((s) => s.setFps);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Compute live FPS
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();

    const loop = () => {
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;
      }
      requestAnimationFrame(loop);
    };
    const id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [setFps]);

  return (
    <div className="absolute bottom-4 left-4 z-30 select-none pointer-events-auto flex flex-col gap-2">
      {/* Settings Popover Drawer */}
      {isSettingsOpen && (
        <div className="rounded-2xl p-4 w-72 bg-[rgba(15,17,20,0.85)] backdrop-blur-xl border border-white/10 shadow-2xl text-xs mb-1 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between pb-2.5 border-b border-white/10 font-bold text-white">
            <span className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
              Settings & View Options
            </span>
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="py-2.5 space-y-3">
            {/* Resolution / Quality */}
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1.5">
                Rendering Quality
              </span>
              <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
                {(['high', 'balanced', 'low'] as const).map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuality(q)}
                    className={`py-1 rounded-lg text-[11px] font-medium capitalize transition-all ${
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

            <div className="pt-2 border-t border-white/10 space-y-2">
              {/* Plan View Toggle (for 3D mesh model) */}
              {viewMode === 'mesh' && (
                <button
                  onClick={toggleTopDownView}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                    isTopDownView
                      ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300'
                      : 'bg-slate-900/40 border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Map className="w-3.5 h-3.5" />
                    Top-Down Plan View
                  </span>
                  <span className="text-[10px] font-mono">{isTopDownView ? 'ON' : 'OFF'}</span>
                </button>
              )}

              {/* Labels Toggle */}
              <button
                onClick={() => setShowLabels(!showLabels)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                  showLabels
                    ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300'
                    : 'bg-slate-900/40 border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5" />
                  3D Room Labels
                </span>
                <span className="text-[10px] font-mono">{showLabels ? 'ON' : 'OFF'}</span>
              </button>

              {/* Floor Plan Alignment Mode Toggle */}
              <button
                onClick={toggleAlignMode}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                  isAlignMode
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-900/40 border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5" />
                  Align Model with Scan
                </span>
                <span className="text-[10px] font-mono">{isAlignMode ? 'ACTIVE' : 'ALIGN'}</span>
              </button>

              {/* Calibration Panel Toggle (Key T) */}
              <button
                onClick={toggleCalibration}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                  isCalibrationOpen
                    ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300'
                    : 'bg-slate-900/40 border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Maximize2 className="w-3.5 h-3.5" />
                  Scan Calibration (Key T)
                </span>
                <span className="text-[10px] font-mono">{isCalibrationOpen ? 'OPEN' : 'T'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Bar: FPS + Settings Popover Button */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[rgba(15,17,20,0.7)] backdrop-blur-md border border-white/10 shadow-xl">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono text-cyan-400">
          <Activity className="w-3.5 h-3.5" />
          <span>{fps} fps</span>
        </div>

        <button
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-200 text-xs font-medium border border-white/10 transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
          <span>Settings</span>
          {isSettingsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
