import React from 'react';
import { useStore } from '../state/useStore';
import { ALL_POIS } from '../data/poiDatabase';
import { findPath } from '../navigation/astar';
import { generateTurnDirections } from '../navigation/turnByTurn';
import { POI } from '../types/floorplan';
import { X, MapPin, Wrench, Cpu, Printer, Flame, Users, DoorOpen } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const DestinationsDrawer: React.FC<Props> = ({ isOpen, onClose }) => {
  const userPosition = useStore((s) => s.userPosition);
  const setDestination = useStore((s) => s.setDestination);
  const setNavigationRoute = useStore((s) => s.setNavigationRoute);

  if (!isOpen) return null;

  const handleSelect = (poi: POI) => {
    setDestination(poi);
    const path = findPath(
      userPosition[0],
      userPosition[2],
      poi.position[0],
      poi.position[2]
    );
    if (path.length >= 2) {
      const { directions, totalDistance } = generateTurnDirections(path, poi);
      setNavigationRoute(path, directions, totalDistance);
    }
    onClose();
  };

  const getCategoryIcon = (poi: POI) => {
    if (poi.roomId === 'workshop') return <Wrench className="w-4 h-4 text-amber-400" />;
    if (poi.roomId === 'electronics') return <Cpu className="w-4 h-4 text-emerald-400" />;
    if (poi.roomId === '3d_printing') return <Printer className="w-4 h-4 text-cyan-400" />;
    if (poi.roomId === 'laser_cabin') return <Flame className="w-4 h-4 text-rose-400" />;
    if (poi.roomId === 'meeting_room') return <Users className="w-4 h-4 text-purple-400" />;
    if (poi.category === 'exit' || poi.roomId === 'entrance') return <DoorOpen className="w-4 h-4 text-yellow-400" />;
    return <MapPin className="w-4 h-4 text-cyan-400" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl bg-[rgba(15,17,20,0.9)] backdrop-blur-xl border border-white/10 shadow-2xl p-5 text-slate-100 flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white tracking-tight">Select Destination</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* POI list */}
        <div className="py-2 overflow-y-auto space-y-1.5 pr-1 divide-y divide-white/5">
          {ALL_POIS.map((poi) => {
            const dist = Math.round(
              Math.hypot(userPosition[0] - poi.position[0], userPosition[2] - poi.position[2]) * 10
            ) / 10;

            return (
              <button
                key={poi.id}
                onClick={() => handleSelect(poi)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-black/40 border border-white/5 shrink-0 group-hover:border-cyan-500/30">
                    {getCategoryIcon(poi)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs md:text-sm font-semibold text-white truncate group-hover:text-cyan-400 transition-colors">
                      {poi.name}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">{poi.roomName}</div>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-2">
                  <span className="text-xs font-mono text-cyan-400">{dist}m</span>
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
