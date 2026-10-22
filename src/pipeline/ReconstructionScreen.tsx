import React, { useState, useEffect } from 'react';
import { useStore } from '../state/useStore';
import {
  Camera,
  Layers,
  Cpu,
  Sparkles,
  CheckCircle2,
  Play,
  RotateCcw,
  Compass,
  ArrowRight,
  Info,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface Stage {
  id: number;
  name: string;
  desc: string;
  stat: string;
  icon: any;
}

const STAGES: Stage[] = [
  {
    id: 1,
    name: 'Smartphone Frame Extraction',
    desc: 'Extracting keyframes & camera poses from 4K 60fps walking video',
    stat: '214 Frames @ 3840×2160',
    icon: Camera,
  },
  {
    id: 2,
    name: 'Feature Matching & SfM',
    desc: 'SuperPoint deep keypoint detection & LightGlue epipolar matching',
    stat: '18,450 Matched Keypoints (0.38px error)',
    icon: Cpu,
  },
  {
    id: 3,
    name: 'Sparse Point Cloud',
    desc: 'Bundle adjustment and camera trajectory triangulation',
    stat: '42,100 Sparse 3D Points',
    icon: Sparkles,
  },
  {
    id: 4,
    name: 'Dense Neural Reconstruction',
    desc: 'Multi-View Stereo (MVS) depth estimation & surface normals',
    stat: '240,000 Dense Points (Density: 98.4%)',
    icon: Layers,
  },
  {
    id: 5,
    name: 'Mesh Poisson Surface & UV Texture',
    desc: 'Screened Poisson meshing, normal baking & instanced asset baking',
    stat: '38,420 Triangles (PBR Shaders)',
    icon: Zap,
  },
  {
    id: 6,
    name: 'Semantic Segmentation & POI Indexing',
    desc: '3D spatial bounding boxes for 34 PCs, 2 Labs, HOD cabin & exits',
    stat: '42 Spatial POIs Identified',
    icon: ShieldCheck,
  },
];

export const ReconstructionScreen: React.FC = () => {
  const setCurrentMode = useStore((s) => s.setCurrentMode);
  const setCameraMode = useStore((s) => s.setCameraMode);
  const togglePointCloud = useStore((s) => s.togglePointCloud);
  const showPointCloud = useStore((s) => s.showPointCloud);

  const [isRunning, setIsRunning] = useState(false);
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [stageProgress, setStageProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Step through reconstruction pipeline animation
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setStageProgress((prev) => {
        if (prev >= 100) {
          if (currentStageIdx < STAGES.length - 1) {
            setCurrentStageIdx((s) => s + 1);
            return 0;
          } else {
            setIsRunning(false);
            setIsCompleted(true);
            return 100;
          }
        }
        return prev + 12; // Progress speed
      });
    }, 180);

    return () => clearInterval(interval);
  }, [isRunning, currentStageIdx]);

  const handleStart = () => {
    setIsRunning(true);
    setCurrentStageIdx(0);
    setStageProgress(0);
    setIsCompleted(false);
  };

  const handleEnterTwin = () => {
    setCurrentMode('roam');
    setCameraMode('orbit'); // dollhouse view
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 md:p-8 bg-gradient-to-b from-[#0a0d14]/95 via-[#0d131f]/90 to-[#0a0d14]/95 backdrop-blur-xl select-none">
      <div className="w-full max-w-5xl glass-panel-glow rounded-2xl p-6 md:p-8 shadow-2xl border border-slate-700/50 flex flex-col max-h-[92vh] overflow-y-auto">
        
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <Compass className="w-6 h-6 animate-spin-slow" />
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-sans">
                Raasta <span className="text-emerald-400">3D</span> Spatial Engine
              </h1>
            </div>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Techfest IIT Bombay • Namma Space End-to-End Digital Twin & Navigation Platform
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Synthetic demo badge required by prompt & rules */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              Demo mode: synthetic data
            </span>

            <button
              onClick={handleEnterTwin}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs md:text-sm text-slate-200 transition-all font-medium"
            >
              Skip to Twin
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </div>

        {/* Pipeline Visual Stages */}
        <div className="my-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Reconstruction Pipeline Stages
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Stage {Math.min(currentStageIdx + 1, STAGES.length)} of {STAGES.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {STAGES.map((stage, idx) => {
              const Icon = stage.icon;
              const isPast = isCompleted || idx < currentStageIdx;
              const isCurrent = isRunning && idx === currentStageIdx;

              return (
                <div
                  key={stage.id}
                  className={`relative p-4 rounded-xl border transition-all duration-300 ${
                    isCurrent
                      ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                      : isPast
                      ? 'bg-slate-900/60 border-emerald-500/30 text-slate-300'
                      : 'bg-slate-900/30 border-slate-800/80 text-slate-500 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`p-2 rounded-lg ${
                          isCurrent
                            ? 'bg-emerald-500 text-slate-950'
                            : isPast
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-white">{stage.name}</h4>
                        <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">
                          {stage.stat}
                        </span>
                      </div>
                    </div>

                    {isPast && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">
                    {stage.desc}
                  </p>

                  {/* Stage Progress Bar */}
                  {isCurrent && (
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
                      <div
                        className="bg-emerald-400 h-full rounded-full transition-all duration-150"
                        style={{ width: `${stageProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Telemetry Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 mb-6 font-mono text-xs">
          <div>
            <div className="text-slate-500 text-[10px] uppercase">Input Capture</div>
            <div className="text-white font-semibold mt-0.5">4K @ 60fps Video</div>
          </div>
          <div>
            <div className="text-slate-500 text-[10px] uppercase">Reprojection Error</div>
            <div className="text-emerald-400 font-semibold mt-0.5">0.38 px (Sub-pixel)</div>
          </div>
          <div>
            <div className="text-slate-500 text-[10px] uppercase">Total Surface Polygons</div>
            <div className="text-cyan-400 font-semibold mt-0.5">38,420 Triangles</div>
          </div>
          <div>
            <div className="text-slate-500 text-[10px] uppercase">Indexed POIs</div>
            <div className="text-amber-400 font-semibold mt-0.5">42 Landmarks</div>
          </div>
        </div>

        {/* Namma Space IIT Bombay Qualification Tip Banner */}
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/30 text-blue-200 text-xs mb-6">
          <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-blue-300">IIT Bombay Round 1 & Round 2 Guideline:</span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              This interactive prototype simulates the photogrammetry/NeRF pipeline using procedural college geometry.
              To submit real smartphone video captures (hostel room, lab, corridor), capture ~1 min video, process in Luma AI / Polycam / KIRI Engine, export as <strong>.glb</strong> or <strong>.ply</strong>, and load it instantly using the <strong>"Load Your Own Model"</strong> feature in the top navigation bar!
            </p>
          </div>
        </div>

        {/* Bottom Action Footer */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            {isRunning ? (
              <span className="flex items-center gap-2 text-emerald-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Executing neural point densification & Poisson surface solver...
              </span>
            ) : isCompleted ? (
              <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Reconstruction complete! Ready for 3D walkthrough & navigation.
              </span>
            ) : (
              <span>Click "Start Reconstruction" to simulate the smartphone-to-3D twin pipeline.</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!isRunning && !isCompleted && (
              <button
                onClick={handleStart}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                Start Reconstruction
              </button>
            )}

            {isRunning && (
              <button
                onClick={() => {
                  setIsRunning(false);
                  setIsCompleted(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-all"
              >
                Fast-Forward
              </button>
            )}

            {isCompleted && (
              <>
                <button
                  onClick={handleStart}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Replay
                </button>
                <button
                  onClick={handleEnterTwin}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/30 transition-all hover:scale-105"
                >
                  Explore 3D Digital Twin
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
