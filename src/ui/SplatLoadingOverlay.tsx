import React, { useState } from 'react';
import { useStore } from '../state/useStore';
import { Sparkles, AlertCircle, ArrowRight } from 'lucide-react';

export const SplatLoadingOverlay: React.FC = () => {
  const splatLoading = useStore((s) => s.splatLoading);
  const viewMode = useStore((s) => s.viewMode);
  const [hasStartedWalking, setHasStartedWalking] = useState(false);

  // If in 'mesh' mode (default 3D Model), don't block the screen!
  if (viewMode !== 'splat') return null;

  if (hasStartedWalking && splatLoading.isLoaded) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl select-none">
      <div className="w-full max-w-md rounded-2xl p-6 bg-[rgba(15,17,20,0.9)] border border-white/10 shadow-2xl text-center">
        
        {/* Icon & Title */}
        <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>

        <h1 className="text-xl font-extrabold text-white tracking-tight">
          Raasta <span className="text-cyan-400">3D</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Loading Real Gaussian Splat (968,065 Gaussians)
        </p>

        {/* Progress or Error */}
        {splatLoading.error ? (
          <div className="my-5 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-start gap-2 text-left">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Error Loading Splat</span>
              <p className="text-[11px] text-red-300 mt-0.5">{splatLoading.error}</p>
            </div>
          </div>
        ) : (
          <div className="my-6">
            <div className="flex justify-between text-xs mb-1.5 font-mono">
              <span className="text-slate-400">
                {splatLoading.isLoaded ? 'Lab Loaded. Ready to walk.' : 'Decompressing SPZ & compiling shaders...'}
              </span>
              <span className="text-cyan-400 font-bold">{splatLoading.progress}%</span>
            </div>

            {/* Real Progress Bar */}
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-cyan-400 rounded-full transition-all duration-200"
                style={{ width: `${splatLoading.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Enter Button */}
        <button
          disabled={!splatLoading.isLoaded}
          onClick={() => setHasStartedWalking(true)}
          className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
            splatLoading.isLoaded
              ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/25 hover:scale-[1.02] cursor-pointer'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          {splatLoading.isLoaded ? (
            <>
              Click to Walk in Real Scan
              <ArrowRight className="w-4 h-4" />
            </>
          ) : (
            'Preparing Neural Radiance Field...'
          )}
        </button>

        {/* Shortcuts guide */}
        <div className="mt-5 pt-4 border-t border-white/5 grid grid-cols-2 gap-2 text-[11px] text-slate-400 text-left">
          <div><b className="text-slate-200">W A S D</b> move</div>
          <div><b className="text-slate-200">Mouse</b> look around</div>
          <div><b className="text-slate-200">Shift</b> walk faster</div>
          <div><b className="text-slate-200">Esc</b> release cursor</div>
        </div>
      </div>
    </div>
  );
};
