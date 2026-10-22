import React, { useState, useEffect } from 'react';
import { useStore } from '../state/useStore';
import {
  Layers,
  Tag,
  Sun,
  Grid,
  Sparkles,
  Zap,
  Shield,
  HelpCircle,
  Activity,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const ControlsOverlay: React.FC = () => {
  const showCeiling = useStore((s) => s.showCeiling);
  const showLabels = useStore((s) => s.showLabels);
  const showShadows = useStore((s) => s.showShadows);
  const showWireframe = useStore((s) => s.showWireframe);
  const showPointCloud = useStore((s) => s.showPointCloud);
  const performanceMode = useStore((s) => s.performanceMode);
  const collisionEnabled = useStore((s) => s.collisionEnabled);

  const toggleCeiling = useStore((s) => s.toggleCeiling);
  const toggleLabels = useStore((s) => s.toggleLabels);
  const toggleShadows = useStore((s) => s.toggleShadows);
  const toggleWireframe = useStore((s) => s.toggleWireframe);
  const togglePointCloud = useStore((s) => s.togglePointCloud);
  const togglePerformanceMode = useStore((s) => s.togglePerformanceMode);
  const toggleCollision = useStore((s) => s.toggleCollision);

  const fps = useStore((s) => s.fps);
  const setFps = useStore((s) => s.setFps);

  const [isOpen, setIsOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

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
      
      {/* Help Modal Popup */}
      {showHelp && (
        <div className="glass-panel-glow rounded-2xl p-4 w-72 mb-2 text-xs border border-slate-700 shadow-2xl animate-in fade-in slide-in-from-bottom duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-700">
            <span className="font-bold text-white flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              Controls & Shortcuts
            </span>
            <button
              onClick={() => setShowHelp(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="py-2.5 space-y-2 text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Move Forward/Back:</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono border border-slate-700">W / S</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Strafe Left/Right:</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono border border-slate-700">A / D</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Sprint / Run:</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono border border-slate-700">Shift</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Look Around:</span>
              <span className="text-emerald-400 text-[11px]">Mouse Lock / Touch</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Inspect Object:</span>
              <span className="text-emerald-400 text-[11px]">Left Click Object</span>
            </div>
          </div>
        </div>
      )}

      {/* Toggles Panel */}
      <div className="glass-panel rounded-2xl border border-slate-700/60 p-2 shadow-2xl">
        <div className="flex items-center gap-2">
          
          {/* FPS Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-emerald-400">
            <Activity className="w-3.5 h-3.5" />
            <span>{fps} FPS</span>
          </div>

          {/* Quick Toggle Controls Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Rendering Toggles</span>
            {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>

          {/* Help Button */}
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700"
            title="Shortcuts guide"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>

        {/* Collapsible Toggles Drawer */}
        {isOpen && (
          <div className="pt-3 mt-2 border-t border-slate-800 grid grid-cols-2 gap-1.5 min-w-[260px] animate-in fade-in duration-150">
            
            {/* Ceiling */}
            <button
              onClick={toggleCeiling}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                showCeiling
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> Ceiling
              </span>
              <span className="text-[10px] font-mono">{showCeiling ? 'ON' : 'OFF'}</span>
            </button>

            {/* Labels */}
            <button
              onClick={toggleLabels}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                showLabels
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> 3D Labels
              </span>
              <span className="text-[10px] font-mono">{showLabels ? 'ON' : 'OFF'}</span>
            </button>

            {/* Shadows */}
            <button
              onClick={toggleShadows}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                showShadows
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5" /> Shadows
              </span>
              <span className="text-[10px] font-mono">{showShadows ? 'ON' : 'OFF'}</span>
            </button>

            {/* Wireframe */}
            <button
              onClick={toggleWireframe}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                showWireframe
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Grid className="w-3.5 h-3.5" /> Wireframe
              </span>
              <span className="text-[10px] font-mono">{showWireframe ? 'ON' : 'OFF'}</span>
            </button>

            {/* Point Cloud */}
            <button
              onClick={togglePointCloud}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                showPointCloud
                  ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> LiDAR Points
              </span>
              <span className="text-[10px] font-mono">{showPointCloud ? 'ON' : 'OFF'}</span>
            </button>

            {/* Performance Mode */}
            <button
              onClick={togglePerformanceMode}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                performanceMode
                  ? 'bg-amber-950/40 border-amber-500/50 text-amber-300'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> Low-End Mode
              </span>
              <span className="text-[10px] font-mono">{performanceMode ? 'ON' : 'OFF'}</span>
            </button>

            {/* Collision Toggle */}
            <button
              onClick={toggleCollision}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors col-span-2 ${
                collisionEnabled
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> Wall & Furniture Collision
              </span>
              <span className="text-[10px] font-mono">{collisionEnabled ? 'ENABLED' : 'DISABLED'}</span>
            </button>

          </div>
        )}
      </div>

    </div>
  );
};
