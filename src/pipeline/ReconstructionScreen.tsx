import React from 'react';
import { useStore } from '../state/useStore';
import {
  Video,
  Filter,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  HardDrive,
  Eye,
} from 'lucide-react';

const REAL_PIPELINE_STAGES = [
  {
    step: '01',
    title: 'Smartphone Video Capture',
    desc: 'Captured via standard handheld smartphone walking in continuous loop trajectory with 70% overlap.',
    telemetry: '1080p @ 30fps • 2 min 26 s duration',
    icon: Video,
    tag: 'Raw Capture',
  },
  {
    step: '02',
    title: 'Frame Extraction & Blur Filter',
    desc: 'Sampled at 5 fps, followed by Laplacian variance blur filter discarding 46 motion-blurred frames.',
    telemetry: '730 extracted → 684 sharp frames',
    icon: Filter,
    tag: 'Pre-processing',
  },
  {
    step: '03',
    title: 'COLMAP Structure from Motion (SfM)',
    desc: 'SIFT feature extraction, sequential matching, camera intrinsic calibration and bundle adjustment.',
    telemetry: '331 frames registered • 27,330 points • 0.79 px error',
    icon: Cpu,
    tag: 'Camera Poses',
  },
  {
    step: '04',
    title: 'Nerfstudio Splatfacto Training',
    desc: 'Trained using Splatfacto with adaptive density control, opacity pruning, and spherical harmonics.',
    telemetry: '15,000 training iterations • NVIDIA Tesla T4',
    icon: Layers,
    tag: 'Neural Optimization',
  },
  {
    step: '05',
    title: 'Gaussian Radiance Field (968k Splats)',
    desc: 'Optimized 3D ellipsoids capturing photorealistic specular reflections, lighting and geometry.',
    telemetry: '968,065 Gaussians • Real Lab Twin',
    icon: Sparkles,
    tag: '3D Splat',
  },
  {
    step: '06',
    title: 'SPZ Compression & Spark Web Viewer',
    desc: 'Packed into compact 16.1 MB compressed SPZ format for instant client-side rendering via @sparkjsdev/spark.',
    telemetry: '16.1 MB payload • 60 FPS in browser',
    icon: HardDrive,
    tag: 'Web Deployment',
  },
];

const THUMBNAILS = [
  { src: '/pipeline/frame1.jpg', label: 'Frame #0012 — Entrance aisle' },
  { src: '/pipeline/frame2.jpg', label: 'Frame #0069 — Desk row A' },
  { src: '/pipeline/frame3.jpg', label: 'Frame #0121 — Workstation monitor' },
  { src: '/pipeline/frame4.jpg', label: 'Frame #0211 — Lab middle aisle' },
  { src: '/pipeline/frame5.jpg', label: 'Frame #0334 — Back storage rack' },
  { src: '/pipeline/frame6.jpg', label: 'Frame #0372 — Faculty podium' },
];

export const ReconstructionScreen: React.FC = () => {
  const setCurrentMode = useStore((s) => s.setCurrentMode);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-xl select-none overflow-y-auto">
      <div className="w-full max-w-5xl rounded-2xl p-6 md:p-8 bg-[rgba(15,17,20,0.85)] border border-white/10 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto my-auto">
        
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                <Sparkles className="w-5 h-5" />
              </span>
              <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
                Real 3D Reconstruction Pipeline
              </h1>
            </div>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Techfest IIT Bombay • Phone Video to 968,065 Gaussian Splats Digital Twin
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              Trained Model: public/lab.spz
            </span>

            <button
              onClick={() => setCurrentMode('roam')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs md:text-sm transition-all shadow-lg shadow-cyan-500/20"
            >
              <Eye className="w-4 h-4" />
              Return to 3D Walk
            </button>
          </div>
        </div>

        {/* 6 Real Captured Frame Thumbnails */}
        <div className="my-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <Video className="w-4 h-4 text-cyan-400" />
            Raw Smartphone Video Keyframes (IIT Bombay CSE Lab Capture)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {THUMBNAILS.map((thumb, idx) => (
              <div
                key={idx}
                className="group relative rounded-xl overflow-hidden border border-white/10 bg-slate-900/60 aspect-video shadow-md"
              >
                <img
                  src={thumb.src}
                  alt={thumb.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    // Fallback placeholder if image takes a second
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/90 to-transparent text-[9px] text-slate-300 truncate">
                  {thumb.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real Pipeline Stages with Verified Metrics */}
        <div className="my-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-cyan-400" />
            End-to-End Processing Stages & Telemetry
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {REAL_PIPELINE_STAGES.map((stage) => {
              const Icon = stage.icon;
              return (
                <div
                  key={stage.step}
                  className="p-3.5 rounded-xl border border-white/10 bg-[rgba(255,255,255,0.02)] hover:border-cyan-500/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-mono text-cyan-400 font-bold">
                          STAGE {stage.step}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9px] bg-slate-800 text-slate-300 font-medium border border-slate-700">
                        {stage.tag}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white mb-1">{stage.title}</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{stage.desc}</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-white/5 font-mono text-[10px] text-cyan-300 font-medium">
                    {stage.telemetry}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Verified Pipeline Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-black/60 border border-white/10 my-4 text-xs font-mono">
          <div>
            <div className="text-slate-500 text-[10px] uppercase">Registered Frames</div>
            <div className="text-white font-semibold mt-0.5">331 of 684 (COLMAP)</div>
          </div>
          <div>
            <div className="text-slate-500 text-[10px] uppercase">Mean Reprojection Error</div>
            <div className="text-cyan-400 font-semibold mt-0.5">0.79 px</div>
          </div>
          <div>
            <div className="text-slate-500 text-[10px] uppercase">Trained Gaussians</div>
            <div className="text-emerald-400 font-semibold mt-0.5">968,065 Splats</div>
          </div>
          <div>
            <div className="text-slate-500 text-[10px] uppercase">File Payload</div>
            <div className="text-purple-400 font-semibold mt-0.5">16.1 MB (.spz)</div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="text-[11px] text-slate-400">
            Navigation layer (floor-plan proxy) calibrated to match the real lab scan.
          </div>

          <button
            onClick={() => setCurrentMode('roam')}
            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-lg"
          >
            Walk Inside 3D Lab
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
