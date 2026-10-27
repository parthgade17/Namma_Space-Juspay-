import React from 'react';
import { useStore } from '../state/useStore';
import { findPath } from '../navigation/astar';
import { generateTurnDirections } from '../navigation/turnByTurn';
import { X, Navigation, Monitor, CheckCircle2, AlertCircle } from 'lucide-react';

export const ObjectInfoCard: React.FC = () => {
  const selectedObject = useStore((s) => s.selectedObject);
  const setSelectedObject = useStore((s) => s.setSelectedObject);
  const userPosition = useStore((s) => s.userPosition);
  const setDestination = useStore((s) => s.setDestination);
  const setNavigationRoute = useStore((s) => s.setNavigationRoute);

  if (!selectedObject) return null;

  const handleNavigate = () => {
    const poi = {
      id: selectedObject.id,
      name: selectedObject.name,
      category: 'workstation' as const,
      roomId: selectedObject.room,
      roomName: selectedObject.room,
      position: selectedObject.position,
      description: selectedObject.type,
    };

    setDestination(poi);

    // Compute A* route
    const path = findPath(
      userPosition[0],
      userPosition[2],
      selectedObject.position[0],
      selectedObject.position[2]
    );

    if (path.length >= 2) {
      const { directions, totalDistance } = generateTurnDirections(path, poi);
      setNavigationRoute(path, directions, totalDistance);
    }

    setSelectedObject(null);
  };

  return (
    <div className="fixed sm:absolute bottom-16 sm:bottom-auto sm:top-20 left-3 right-3 sm:left-auto sm:right-4 z-40 sm:w-80 max-w-sm mx-auto sm:mx-0 select-none pointer-events-auto animate-in fade-in slide-in-from-bottom sm:slide-in-from-right duration-200">
      <div className="rounded-2xl p-4 bg-[rgba(15,17,20,0.85)] backdrop-blur-xl border border-white/10 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                {selectedObject.type}
              </span>
              <h3 className="text-base font-bold text-white leading-tight">
                {selectedObject.name}
              </h3>
            </div>
          </div>

          <button
            onClick={() => setSelectedObject(null)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Location & Details */}
        <div className="py-3 space-y-2 text-xs">
          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-500">Location Space:</span>
            <span className="font-medium text-white">{selectedObject.room}</span>
          </div>

          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-500">Coordinates:</span>
            <span className="font-mono text-cyan-400">
              [{selectedObject.position[0].toFixed(1)}, {selectedObject.position[2].toFixed(1)}]
            </span>
          </div>

          {selectedObject.meta && (
            <div className="pt-2 border-t border-white/5 space-y-1.5">
              {Object.entries(selectedObject.meta).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500 capitalize">{key}:</span>
                  <span className="font-medium text-slate-200">
                    {key === 'status' ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300">
                        <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                        {value}
                      </span>
                    ) : (
                      String(value)
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-white/10">
          <button
            onClick={handleNavigate}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02]"
          >
            <Navigation className="w-4 h-4" />
            Navigate to this Location
          </button>
        </div>

      </div>
    </div>
  );
};
