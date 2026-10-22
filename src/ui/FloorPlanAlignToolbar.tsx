import React, { useState } from 'react';
import { useStore } from '../state/useStore';
import { Sliders, Copy, Check, X, RotateCw, Move, Maximize2 } from 'lucide-react';
import floorPlanData from '../data/floorplan.json';

export const FloorPlanAlignToolbar: React.FC = () => {
  const isAlignMode = useStore((s) => s.isAlignMode);
  const toggleAlignMode = useStore((s) => s.toggleAlignMode);
  const floorPlanTransform = useStore((s) => s.floorPlanTransform);
  const setFloorPlanTransform = useStore((s) => s.setFloorPlanTransform);
  const [copied, setCopied] = useState(false);

  if (!isAlignMode) return null;

  const handleCopyJSON = () => {
    // Generate aligned floorplan with transform baked into room bounds
    const cosR = Math.cos(floorPlanTransform.rotation);
    const sinR = Math.sin(floorPlanTransform.rotation);
    const s = floorPlanTransform.scale;
    const tx = floorPlanTransform.x;
    const tz = floorPlanTransform.z;

    const transformPoint = (x: number, z: number) => {
      const sx = x * s;
      const sz = z * s;
      const rx = sx * cosR - sz * sinR + tx;
      const rz = sx * sinR + sz * cosR + tz;
      return [Math.round(rx * 100) / 100, Math.round(rz * 100) / 100];
    };

    const alignedData = {
      ...floorPlanData,
      alignmentTransform: floorPlanTransform,
      rooms: floorPlanData.rooms.map((room) => {
        const [minX, minZ] = transformPoint(room.bounds.minX, room.bounds.minZ);
        const [maxX, maxZ] = transformPoint(room.bounds.maxX, room.bounds.maxZ);
        return {
          ...room,
          bounds: {
            minX: Math.min(minX, maxX),
            maxX: Math.max(minX, maxX),
            minZ: Math.min(minZ, maxZ),
            maxZ: Math.max(minZ, maxZ),
          },
        };
      }),
    };

    navigator.clipboard.writeText(JSON.stringify(alignedData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-2xl select-none pointer-events-auto">
      <div className="rounded-2xl p-4 bg-[rgba(15,17,20,0.85)] backdrop-blur-xl border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
              <Sliders className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Align Floor Plan to Gaussian Splat
              </h3>
              <p className="text-[11px] text-slate-400">
                Top-down orthographic view: drag sliders to align proxy walls with the scan
              </p>
            </div>
          </div>
          <button
            onClick={toggleAlignMode}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 text-xs">
          {/* Offset X */}
          <div>
            <div className="flex justify-between text-slate-400 text-[10px] uppercase mb-1">
              <span>Offset X</span>
              <span className="text-cyan-400 font-mono">{floorPlanTransform.x.toFixed(2)}m</span>
            </div>
            <input
              type="range"
              min="-15"
              max="15"
              step="0.05"
              value={floorPlanTransform.x}
              onChange={(e) => setFloorPlanTransform({ x: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400"
            />
          </div>

          {/* Offset Z */}
          <div>
            <div className="flex justify-between text-slate-400 text-[10px] uppercase mb-1">
              <span>Offset Z</span>
              <span className="text-cyan-400 font-mono">{floorPlanTransform.z.toFixed(2)}m</span>
            </div>
            <input
              type="range"
              min="-15"
              max="15"
              step="0.05"
              value={floorPlanTransform.z}
              onChange={(e) => setFloorPlanTransform({ z: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400"
            />
          </div>

          {/* Rotation */}
          <div>
            <div className="flex justify-between text-slate-400 text-[10px] uppercase mb-1">
              <span>Rotate</span>
              <span className="text-cyan-400 font-mono">
                {Math.round((floorPlanTransform.rotation * 180) / Math.PI)}°
              </span>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              step="1"
              value={Math.round((floorPlanTransform.rotation * 180) / Math.PI)}
              onChange={(e) =>
                setFloorPlanTransform({
                  rotation: (parseFloat(e.target.value) * Math.PI) / 180,
                })
              }
              className="w-full accent-cyan-400"
            />
          </div>

          {/* Scale */}
          <div>
            <div className="flex justify-between text-slate-400 text-[10px] uppercase mb-1">
              <span>Scale</span>
              <span className="text-cyan-400 font-mono">{floorPlanTransform.scale.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.3"
              max="3"
              step="0.05"
              value={floorPlanTransform.scale}
              onChange={(e) => setFloorPlanTransform({ scale: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400"
            />
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
          <span className="text-[11px] text-slate-400">
            Navigation layer (floor-plan proxy)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow-md"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied JSON!' : 'Copy JSON'}
            </button>
            <button
              onClick={toggleAlignMode}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
            >
              Done Aligning
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
