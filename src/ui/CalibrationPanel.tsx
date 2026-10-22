import React, { useState } from 'react';
import { useStore } from '../state/useStore';
import { X, Copy, Check, SlidersHorizontal, MapPin } from 'lucide-react';

export const CalibrationPanel: React.FC = () => {
  const isCalibrationOpen = useStore((s) => s.isCalibrationOpen);
  const toggleCalibration = useStore((s) => s.toggleCalibration);
  const scanConfig = useStore((s) => s.scanConfig);
  const setScanConfig = useStore((s) => s.setScanConfig);
  const userPosition = useStore((s) => s.userPosition);
  const userRotation = useStore((s) => s.userRotation);

  const [copied, setCopied] = useState(false);
  const [boundsEnabled, setBoundsEnabled] = useState(true);

  if (!isCalibrationOpen) return null;

  const round = (v: number) => Math.round(v * 100) / 100;

  const handleSetMinBound = () => {
    const curBounds = scanConfig.bounds || { minX: 0, maxX: 0, minZ: 0, maxZ: 0 };
    setScanConfig({
      bounds: {
        ...curBounds,
        minX: round(userPosition[0]),
        minZ: round(userPosition[2]),
      },
    });
  };

  const handleSetMaxBound = () => {
    const curBounds = scanConfig.bounds || { minX: 0, maxX: 0, minZ: 0, maxZ: 0 };
    setScanConfig({
      bounds: {
        ...curBounds,
        maxX: round(userPosition[0]),
        maxZ: round(userPosition[2]),
      },
    });
  };

  const handleSetStart = () => {
    setScanConfig({
      start: [round(userPosition[0]), round(userPosition[2])],
      startYaw: Math.round((userRotation * 180) / Math.PI),
    });
  };

  const handleToggleBounds = () => {
    setBoundsEnabled(!boundsEnabled);
    if (boundsEnabled) {
      setScanConfig({ bounds: null });
    } else {
      setScanConfig({ bounds: { minX: -18, maxX: 18, minZ: -10, maxZ: 10 } });
    }
  };

  const configJsonString = JSON.stringify(scanConfig, null, 2);

  const handleCopyConfig = () => {
    navigator.clipboard.writeText(configJsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed top-16 right-4 z-50 w-84 md:w-96 max-h-[85vh] overflow-y-auto rounded-2xl p-4 bg-[rgba(15,17,20,0.9)] backdrop-blur-xl border border-white/10 shadow-2xl text-xs select-none pointer-events-auto">
      <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
        <span className="font-bold text-white flex items-center gap-1.5">
          <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
          Splat Calibration (Key T)
        </span>
        <button onClick={toggleCalibration} className="text-slate-400 hover:text-white p-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="py-2.5 space-y-2 text-slate-300">
        {/* Rotate X */}
        <div>
          <div className="flex justify-between text-[11px] mb-0.5">
            <span>Rotate X</span>
            <span className="font-mono text-cyan-400">{scanConfig.rotation[0]}°</span>
          </div>
          <input
            type="range"
            min="-180"
            max="180"
            step="1"
            value={scanConfig.rotation[0]}
            onChange={(e) =>
              setScanConfig({
                rotation: [parseFloat(e.target.value), scanConfig.rotation[1], scanConfig.rotation[2]],
              })
            }
            className="w-full accent-cyan-400"
          />
        </div>

        {/* Rotate Y */}
        <div>
          <div className="flex justify-between text-[11px] mb-0.5">
            <span>Rotate Y</span>
            <span className="font-mono text-cyan-400">{scanConfig.rotation[1]}°</span>
          </div>
          <input
            type="range"
            min="-180"
            max="180"
            step="1"
            value={scanConfig.rotation[1]}
            onChange={(e) =>
              setScanConfig({
                rotation: [scanConfig.rotation[0], parseFloat(e.target.value), scanConfig.rotation[2]],
              })
            }
            className="w-full accent-cyan-400"
          />
        </div>

        {/* Rotate Z */}
        <div>
          <div className="flex justify-between text-[11px] mb-0.5">
            <span>Rotate Z</span>
            <span className="font-mono text-cyan-400">{scanConfig.rotation[2]}°</span>
          </div>
          <input
            type="range"
            min="-180"
            max="180"
            step="1"
            value={scanConfig.rotation[2]}
            onChange={(e) =>
              setScanConfig({
                rotation: [scanConfig.rotation[0], scanConfig.rotation[1], parseFloat(e.target.value)],
              })
            }
            className="w-full accent-cyan-400"
          />
        </div>

        {/* Scale */}
        <div>
          <div className="flex justify-between text-[11px] mb-0.5">
            <span>Scale</span>
            <span className="font-mono text-cyan-400">{scanConfig.scale.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="10"
            step="0.05"
            value={scanConfig.scale}
            onChange={(e) => setScanConfig({ scale: parseFloat(e.target.value) })}
            className="w-full accent-cyan-400"
          />
        </div>

        {/* Model Height */}
        <div>
          <div className="flex justify-between text-[11px] mb-0.5">
            <span>Model Height (Y)</span>
            <span className="font-mono text-cyan-400">{scanConfig.modelY.toFixed(2)}m</span>
          </div>
          <input
            type="range"
            min="-10"
            max="10"
            step="0.05"
            value={scanConfig.modelY}
            onChange={(e) => setScanConfig({ modelY: parseFloat(e.target.value) })}
            className="w-full accent-cyan-400"
          />
        </div>

        {/* Eye Height */}
        <div>
          <div className="flex justify-between text-[11px] mb-0.5">
            <span>Eye Height</span>
            <span className="font-mono text-cyan-400">{scanConfig.eyeHeight.toFixed(2)}m</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.05"
            value={scanConfig.eyeHeight}
            onChange={(e) => setScanConfig({ eyeHeight: parseFloat(e.target.value) })}
            className="w-full accent-cyan-400"
          />
        </div>

        {/* Near Clip */}
        <div>
          <div className="flex justify-between text-[11px] mb-0.5">
            <span>Near Clip</span>
            <span className="font-mono text-cyan-400">{scanConfig.near.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.02"
            max="1.5"
            step="0.01"
            value={scanConfig.near}
            onChange={(e) => setScanConfig({ near: parseFloat(e.target.value) })}
            className="w-full accent-cyan-400"
          />
        </div>

        {/* Field of View */}
        <div>
          <div className="flex justify-between text-[11px] mb-0.5">
            <span>Field of View</span>
            <span className="font-mono text-cyan-400">{scanConfig.fov}°</span>
          </div>
          <input
            type="range"
            min="40"
            max="90"
            step="1"
            value={scanConfig.fov}
            onChange={(e) => setScanConfig({ fov: parseFloat(e.target.value) })}
            className="w-full accent-cyan-400"
          />
        </div>

        {/* Boundary & Start Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
          <button
            onClick={handleSetMinBound}
            className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-200"
          >
            Bound Corner A = Here
          </button>
          <button
            onClick={handleSetMaxBound}
            className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-200"
          >
            Bound Corner B = Here
          </button>
          <button
            onClick={handleSetStart}
            className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-200"
          >
            Start Point = Here
          </button>
          <button
            onClick={handleToggleBounds}
            className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-200"
          >
            {scanConfig.bounds ? 'Bounds: ON' : 'Bounds: OFF'}
          </button>
        </div>

        {/* Config JSON & Copy */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-slate-400">scanConfig.json</span>
            <button
              onClick={handleCopyConfig}
              className="flex items-center gap-1 text-[10px] text-cyan-400 hover:underline"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied!' : 'Copy Config'}
            </button>
          </div>
          <textarea
            readOnly
            value={configJsonString}
            rows={5}
            className="w-full p-2 bg-slate-950 font-mono text-[9px] text-slate-400 rounded-lg border border-slate-800 outline-none"
          />
        </div>
      </div>
    </div>
  );
};
