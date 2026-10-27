import React, { useState, useEffect } from 'react';
import { Eye, Footprints, Search, ArrowRight, Check, X } from 'lucide-react';

export const OnboardingModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    const done = localStorage.getItem('raasta_onboarding_done');
    if (!done) {
      setIsOpen(true);
    }
  }, []);

  const handleFinish = () => {
    localStorage.setItem('raasta_onboarding_done', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={handleFinish}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-[rgba(15,17,20,0.92)] backdrop-blur-xl border border-white/10 shadow-2xl p-6 text-slate-100 flex flex-col gap-5 relative select-none pointer-events-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Welcome to <span className="text-cyan-400">Raasta 3D</span>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Step {step} of 3</span>
            <button
              onClick={handleFinish}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors ml-1 cursor-pointer"
              title="Close guide"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Steps Content */}
        {step === 1 && (
          <div className="flex flex-col items-center text-center py-4 gap-3 animate-in fade-in duration-150">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10">
              <Eye className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white">Drag to Look</h3>
            <p className="text-xs text-slate-300 max-w-xs leading-relaxed">
              Click and drag anywhere on the canvas to rotate your view and inspect the lab in full 360° first-person perspective.
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col items-center text-center py-4 gap-3 animate-in fade-in duration-150">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
              <Footprints className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white">WASD or Tap Floor to Walk</h3>
            <p className="text-xs text-slate-300 max-w-xs leading-relaxed">
              Use your keyboard <b className="text-white">W, A, S, D</b> keys to stroll through the corridor, or simply <b className="text-cyan-400">click anywhere on the floor</b> to glide there smoothly.
            </p>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center text-center py-4 gap-3 animate-in fade-in duration-150">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-lg shadow-purple-500/10">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white">Search to Get Directions</h3>
            <p className="text-xs text-slate-300 max-w-xs leading-relaxed">
              Use the top search bar or quick destination chips to find machines and rooms. Follow the cyan floor ribbon for instant turn-by-turn guidance.
            </p>
          </div>
        )}

        {/* Progress dots & buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <button
                key={s}
                onClick={() => setStep(s)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  s === step ? 'w-6 bg-cyan-400' : 'w-2 bg-white/20 hover:bg-white/40'
                }`}
                title={`Jump to step ${s}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleFinish}
              className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Skip
            </button>

            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all hover:scale-105 cursor-pointer"
              >
                Next <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" /> Start Exploring
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
