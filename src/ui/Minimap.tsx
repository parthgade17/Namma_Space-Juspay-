import React, { useRef, useEffect, useState } from 'react';
import { useStore } from '../state/useStore';
import floorPlanData from '../data/floorplan.json';
import { ALL_POIS } from '../data/poiDatabase';
import { findPath } from '../navigation/astar';
import { generateTurnDirections } from '../navigation/turnByTurn';
import { Navigation, Maximize2, Minimize2, Map } from 'lucide-react';

export const Minimap: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const userPosition = useStore((s) => s.userPosition);
  const userRotation = useStore((s) => s.userRotation);
  const activePath = useStore((s) => s.activePath);
  const isAutoWalking = useStore((s) => s.isAutoWalking);
  const isEmergency = useStore((s) => s.isEmergency);
  const setDestination = useStore((s) => s.setDestination);
  const setNavigationRoute = useStore((s) => s.setNavigationRoute);

  const [isExpanded, setIsExpanded] = useState(false);

  // Keyboard shortcut M: toggle map expand
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === 'm' || e.key === 'M') {
        setIsExpanded((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Real Lab Metric Bounds
    const minX = -10.0;
    const maxX = 9.5;
    const minZ = -6.0;
    const maxZ = 6.0;

    const toMapX = (x: number) => ((x - minX) / (maxX - minX)) * width;
    const toMapY = (z: number) => ((z - minZ) / (maxZ - minZ)) * height;

    // Clear
    ctx.clearRect(0, 0, width, height);

    if (isExpanded) {
      // 1. FULL EXPANDED 2D PLAN VIEW
      ctx.fillStyle = '#0f1115';
      ctx.fillRect(0, 0, width, height);

      // Grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= width; x += 25) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y <= height; y += 25) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Rooms
      floorPlanData.rooms.forEach((room) => {
        const rx = toMapX(room.bounds.minX);
        const ry = toMapY(room.bounds.minZ);
        const rw = toMapX(room.bounds.maxX) - rx;
        const rh = toMapY(room.bounds.maxZ) - ry;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.fillRect(rx, ry, rw, rh);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(rx, ry, rw, rh);

        // Room Labels
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 9px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(room.name, rx + rw / 2, ry + rh / 2);
      });

      // Route
      if (activePath.length >= 2) {
        const color = isEmergency ? '#ef4444' : '#22d3ee';
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(toMapX(activePath[0][0]), toMapY(activePath[0][2]));
        for (let i = 1; i < activePath.length; i++) {
          ctx.lineTo(toMapX(activePath[i][0]), toMapY(activePath[i][2]));
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // User Dot + FOV
      const ux = toMapX(userPosition[0]);
      const uy = toMapY(userPosition[2]);

      ctx.save();
      ctx.translate(ux, uy);
      ctx.rotate(userRotation + Math.PI);

      ctx.fillStyle = isEmergency ? 'rgba(239, 68, 68, 0.25)' : 'rgba(34, 211, 238, 0.25)';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, 20, -Math.PI / 4, Math.PI / 4);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

    } else {
      // 2. ROUNDED RADAR MINIMAP (ROTATING WITH HEADING)
      const cx = width / 2;
      const cy = height / 2;
      const radius = width / 2 - 2;

      // Circular clip
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();

      ctx.fillStyle = '#0d1117';
      ctx.fillRect(0, 0, width, height);

      // Transform so center is user position, and heading is UP
      ctx.translate(cx, cy);
      ctx.rotate(-userRotation);
      ctx.scale(12, 12); // Radar zoom scale
      ctx.translate(-userPosition[0], -userPosition[2]);

      // Draw rooms
      floorPlanData.rooms.forEach((room) => {
        const rw = room.bounds.maxX - room.bounds.minX;
        const rh = room.bounds.maxZ - room.bounds.minZ;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.fillRect(room.bounds.minX, room.bounds.minZ, rw, rh);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 0.08;
        ctx.strokeRect(room.bounds.minX, room.bounds.minZ, rw, rh);
      });

      // Route
      if (activePath.length >= 2) {
        ctx.strokeStyle = isEmergency ? '#ef4444' : '#22d3ee';
        ctx.lineWidth = 0.15;
        ctx.beginPath();
        ctx.moveTo(activePath[0][0], activePath[0][2]);
        for (let i = 1; i < activePath.length; i++) {
          ctx.lineTo(activePath[i][0], activePath[i][2]);
        }
        ctx.stroke();
      }

      ctx.restore();

      // Fixed Center User Marker & Radar Rings
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.5, 0, Math.PI * 2);
      ctx.arc(cx, cy, radius * 0.85, 0, Math.PI * 2);
      ctx.stroke();

      // Heading arrow (pointing up)
      ctx.fillStyle = '#22d3ee';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 8);
      ctx.lineTo(cx - 4, cy + 5);
      ctx.lineTo(cx + 4, cy + 5);
      ctx.closePath();
      ctx.fill();

      // Walking pulse wave indicator
      if (isAutoWalking) {
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, 12, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Outer border ring
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }, [userPosition, userRotation, activePath, isEmergency, isExpanded, isAutoWalking]);

  // Click or touch on map
  const handleMapInteract = (clientX: number, clientY: number) => {
    if (!isExpanded) {
      setIsExpanded(true);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const clickY = clientY - rect.top;

    const minX = -10.0;
    const maxX = 9.5;
    const minZ = -6.0;
    const maxZ = 6.0;

    const targetX = minX + (clickX / canvas.width) * (maxX - minX);
    const targetZ = minZ + (clickY / canvas.height) * (maxZ - minZ);

    // Find closest room or POI
    let closestPoi = ALL_POIS[0];
    let minDist = Infinity;
    for (const poi of ALL_POIS) {
      const d = Math.hypot(poi.position[0] - targetX, poi.position[2] - targetZ);
      if (d < minDist) {
        minDist = d;
        closestPoi = poi;
      }
    }

    const path = findPath(userPosition[0], userPosition[2], targetX, targetZ);
    if (path.length >= 2) {
      const { directions, totalDistance } = generateTurnDirections(path, closestPoi);
      setDestination(closestPoi);
      setNavigationRoute(path, directions, totalDistance);
    }
  };

  return (
    <div
      className={`rounded-2xl overflow-hidden shadow-2xl bg-[rgba(15,17,20,0.85)] backdrop-blur-xl border border-white/10 transition-all duration-300 pointer-events-auto select-none ${
        isExpanded
          ? 'fixed inset-3 sm:inset-auto sm:bottom-4 sm:right-4 sm:w-96 p-3 z-50 flex flex-col'
          : 'w-22 h-22 sm:w-28 sm:h-28 rounded-full p-1'
      }`}
    >
      {isExpanded && (
        <div className="flex items-center justify-between pb-2 px-1 border-b border-white/10 text-xs font-semibold text-slate-300 mb-2">
          <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
            <Map className="w-4 h-4" />
            2D Interactive Floor Plan
          </span>
          <button
            onClick={() => setIsExpanded(false)}
            className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white cursor-pointer"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={isExpanded ? 360 : 104}
        height={isExpanded ? 240 : 104}
        onClick={(e) => handleMapInteract(e.clientX, e.clientY)}
        onTouchEnd={(e) => {
          if (e.changedTouches.length > 0) {
            handleMapInteract(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
          }
        }}
        className={`block cursor-pointer mx-auto ${isExpanded ? 'rounded-xl max-w-full' : 'rounded-full'}`}
        title={isExpanded ? 'Tap any room to navigate' : 'Tap to expand full plan (Hotkey: M)'}
      />
    </div>
  );
};
