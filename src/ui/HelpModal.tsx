import React from 'react';
import { X, Keyboard, MousePointer, Smartphone, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-[rgba(15,17,20,0.92)] backdrop-blur-xl border border-white/10 shadow-2xl p-4 sm:p-6 text-slate-100 flex flex-col gap-4 sm:gap-5 max-h-[85vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white tracking-tight">Controls & Navigation Guide</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          
          {/* Keyboard Walking */}
          <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-200">
              <Keyboard className="w-4 h-4 text-cyan-400" />
              <span>Keyboard Roaming</span>
            </div>
            <div className="space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span>Move Forward / Back</span>
                <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-white">W / S</span>
              </div>
              <div className="flex justify-between">
                <span>Strafe Left / Right</span>
                <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-white">A / D</span>
              </div>
              <div className="flex justify-between">
                <span>Sprint / Walk Faster</span>
                <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-white">Shift</span>
              </div>
            </div>
          </div>

          {/* Mouse & Tap */}
          <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-200">
              <MousePointer className="w-4 h-4 text-emerald-400" />
              <span>Mouse & Floor Click</span>
            </div>
            <div className="space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span>Look around</span>
                <span className="text-slate-400">Click + Drag</span>
              </div>
              <div className="flex justify-between">
                <span>Walk to point</span>
                <span className="text-cyan-400 font-medium">Click on Floor</span>
              </div>
              <div className="flex justify-between">
                <span>Inspect equipment</span>
                <span className="text-slate-400">Click on 3D Label</span>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-200">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>Quick Hotkeys</span>
            </div>
            <div className="space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span>Focus Search</span>
                <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-white">F</span>
              </div>
              <div className="flex justify-between">
                <span>Guided Tour</span>
                <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-white">T</span>
              </div>
              <div className="flex justify-between">
                <span>Expand Radar Map</span>
                <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-white">M</span>
              </div>
              <div className="flex justify-between">
                <span>Open Help Guide</span>
                <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-white">H</span>
              </div>
            </div>
          </div>

          {/* Mobile Gestures */}
          <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-200">
              <Smartphone className="w-4 h-4 text-purple-400" />
              <span>Mobile Gestures</span>
            </div>
            <div className="space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span>Walk joystick</span>
                <span className="text-slate-400">Bottom-Left Thumb</span>
              </div>
              <div className="flex justify-between">
                <span>Look around</span>
                <span className="text-slate-400">Drag Right Side</span>
              </div>
              <div className="flex justify-between">
                <span>Direct walk</span>
                <span className="text-cyan-400 font-medium">Tap any floor spot</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-all cursor-pointer"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
