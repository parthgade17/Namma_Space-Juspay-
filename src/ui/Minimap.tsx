import React, { useRef, useEffect } from 'react';
import { useStore } from '../state/useStore';
import floorPlanData from '../data/floorplan.json';
import { Navigation, Maximize2, Minimize2 } from 'lucide-react';

const floorPlan = floorPlanData;

export const Minimap: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const userPosition = useStore((s) => s.userPosition);
  const userRotation = useStore((s) => s.userRotation);
  const activePath = useStore((s) => s.activePath);
  const isEmergency = useStore((s) => s.isEmergency);
  const setUserPosition = useStore((s) => s.setUserPosition);
  const floorPlanTransform = useStore((s) => s.floorPlanTransform);

  const [isExpanded, setIsExpanded] = React.useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Coordinate mapping: floor is X: -22 to 22, Z: -13 to 13
    const worldMinX = -22;
    const worldMaxX = 22;
    const worldMinZ = -13;
    const worldMaxZ = 13;

    const mapX = (wx: number) => ((wx - worldMinX) / (worldMaxX - worldMinX)) * width;
    const mapY = (wz: number) => ((wz - worldMinZ) / (worldMaxZ - worldMinZ)) * height;

    // Clear canvas
    ctx.fillStyle = '#0f1115';
    ctx.fillRect(0, 0, width, height);

    // Draw subtle grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw rooms (neutral translucent outlines, NO bright saturated fills)
    floorPlan.rooms.forEach((room) => {
      const b = room.bounds;
      const rx = mapX(b.minX);
      const ry = mapY(b.minZ);
      const rw = mapX(b.maxX) - rx;
      const rh = mapY(b.maxZ) - ry;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.fillRect(rx, ry, rw, rh);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.strokeRect(rx, ry, rw, rh);

      if (isExpanded) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '8px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(room.name.split('(')[0].trim(), rx + rw / 2, ry + rh / 2);
      }
    });

    // Draw Active Navigation Route
    if (activePath.length >= 2) {
      const routeColor = isEmergency ? '#ef4444' : '#22d3ee';
      ctx.strokeStyle = routeColor;
      ctx.lineWidth = isExpanded ? 3 : 2;
      ctx.shadowColor = routeColor;
      ctx.shadowBlur = 6;
      ctx.setLineDash([4, 3]);

      ctx.beginPath();
      ctx.moveTo(mapX(activePath[0][0]), mapY(activePath[0][2]));
      for (let i = 1; i < activePath.length; i++) {
        ctx.lineTo(mapX(activePath[i][0]), mapY(activePath[i][2]));
      }
      ctx.stroke();

      ctx.setLineDash([]);
      ctx.shadowBlur = 0;

      // Draw destination pin
      const dest = activePath[activePath.length - 1];
      const dx = mapX(dest[0]);
      const dy = mapY(dest[2]);
      ctx.fillStyle = routeColor;
      ctx.beginPath();
      ctx.arc(dx, dy, isExpanded ? 4 : 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw User Location & Heading FOV cone
    const ux = mapX(userPosition[0]);
    const uy = mapY(userPosition[2]);

    ctx.save();
    ctx.translate(ux, uy);
    const angle = userRotation + Math.PI;
    ctx.rotate(angle);

    ctx.fillStyle = isEmergency ? 'rgba(239, 68, 68, 0.25)' : 'rgba(34, 211, 238, 0.25)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, isExpanded ? 24 : 16, -Math.PI / 4, Math.PI / 4);
    ctx.closePath();
    ctx.fill();

    // Direction arrow
    ctx.fillStyle = isEmergency ? '#ef4444' : '#22d3ee';
    ctx.beginPath();
    ctx.moveTo(0, isExpanded ? 9 : 6);
    ctx.lineTo(-3, -2);
    ctx.lineTo(3, -2);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // Center user dot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ux, uy, isExpanded ? 3 : 2, 0, Math.PI * 2);
    ctx.fill();
  }, [userPosition, userRotation, activePath, isEmergency, isExpanded, floorPlanTransform]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const worldMinX = -22;
    const worldMaxX = 22;
    const worldMinZ = -13;
    const worldMaxZ = 13;

    const wx = worldMinX + (clickX / canvas.width) * (worldMaxX - worldMinX);
    const wz = worldMinZ + (clickY / canvas.height) * (worldMaxZ - worldMinZ);

    setUserPosition([wx, 1.6, wz]);
  };

  return (
    <div
      className={`rounded-2xl overflow-hidden shadow-2xl bg-[rgba(15,17,20,0.85)] backdrop-blur-xl border border-white/10 transition-all duration-300 pointer-events-auto select-none ${
        isExpanded ? 'w-80 md:w-96' : 'w-48 md:w-56'
      }`}
    >
      <div className="flex items-center justify-between px-3 py-1.5 bg-black/40 border-b border-white/5 text-[11px] font-medium text-slate-300">
        <span className="flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5 text-cyan-400" />
          2D Radar Minimap
        </span>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
          title={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div className="relative p-1 bg-black/60">
        <canvas
          ref={canvasRef}
          width={isExpanded ? 380 : 220}
          height={isExpanded ? 210 : 120}
          onClick={handleCanvasClick}
          className="w-full h-auto cursor-crosshair rounded block"
          title="Click to reposition user"
        />
        <div className="absolute bottom-2 left-2 text-[9px] text-slate-400 font-mono bg-black/80 px-1.5 py-0.5 rounded pointer-events-none border border-white/5">
          X: {userPosition[0].toFixed(1)}m | Z: {userPosition[2].toFixed(1)}m
        </div>
      </div>
    </div>
  );
};
