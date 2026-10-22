import React, { useState, useRef } from 'react';
import { useStore } from '../state/useStore';
import {
  Upload,
  FileCode,
  CheckCircle2,
  AlertCircle,
  X,
  MapPin,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ModelUploadModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const customModel = useStore((s) => s.customModel);
  const setCustomModel = useStore((s) => s.setCustomModel);
  const isPlacingPOI = useStore((s) => s.isPlacingPOI);
  const setIsPlacingPOI = useStore((s) => s.setIsPlacingPOI);

  const [dragActive, setDragActive] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [fileFormat, setFileFormat] = useState<'glb' | 'gltf' | 'ply'>('glb');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'glb' && ext !== 'gltf' && ext !== 'ply') {
      alert('Please upload a 3D model with .glb, .gltf, or .ply format.');
      return;
    }

    const format = ext as 'glb' | 'gltf' | 'ply';
    const objectUrl = URL.createObjectURL(file);

    setSelectedFileName(file.name);
    setFileFormat(format);

    setCustomModel({
      url: objectUrl,
      name: file.name,
      format: format,
      isLoaded: true,
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleResetToProcedural = () => {
    setCustomModel(null);
    setSelectedFileName(null);
    setIsPlacingPOI(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none">
      <div className="w-full max-w-lg glass-panel-glow rounded-2xl p-6 border border-slate-700 shadow-2xl animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Load Real Scanned 3D Model</h3>
              <p className="text-xs text-slate-400">Import your smartphone capture (.glb / .ply)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Upload Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`my-5 p-8 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-emerald-400 bg-emerald-950/30'
              : 'border-slate-700 hover:border-slate-600 bg-slate-900/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".glb,.gltf,.ply"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />

          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-800 flex items-center justify-center text-emerald-400">
            <FolderOpen className="w-6 h-6" />
          </div>

          <p className="text-sm font-semibold text-slate-200">
            {customModel ? `Active: ${customModel.name}` : 'Click to browse or drop file here'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Supports Standard GLB / GLTF or Gaussian/Mesh PLY models
          </p>
        </div>

        {/* POI Tagging Tool */}
        {customModel && (
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-emerald-500/30 mb-5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  Interactive Spatial POI Tagging
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Click on the 3D floor to drop named points of interest
                </p>
              </div>

              <button
                onClick={() => setIsPlacingPOI(!isPlacingPOI)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isPlacingPOI
                    ? 'bg-amber-500 text-slate-950 animate-pulse'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                }`}
              >
                {isPlacingPOI ? 'Placing Active...' : 'Drop POI Pin'}
              </button>
            </div>
          </div>
        )}

        {/* Actions Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          {customModel ? (
            <button
              onClick={handleResetToProcedural}
              className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-medium"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset to Procedural Twin
            </button>
          ) : (
            <span className="text-xs text-slate-500">Procedural model active</span>
          )}

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
