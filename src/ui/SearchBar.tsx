import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X, MapPin, ArrowUpRight, Monitor, School, ShieldAlert, Coffee } from 'lucide-react';
import { useStore } from '../state/useStore';
import { ALL_POIS } from '../data/poiDatabase';
import { POI } from '../types/floorplan';
import { findPath } from '../navigation/astar';
import { generateTurnDirections } from '../navigation/turnByTurn';

export const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'room' | 'workstation' | 'faculty' | 'exit'>('all');

  const userPosition = useStore((s) => s.userPosition);
  const setDestination = useStore((s) => s.setDestination);
  const setNavigationRoute = useStore((s) => s.setNavigationRoute);
  const clearNavigation = useStore((s) => s.clearNavigation);

  const containerRef = useRef<HTMLDivElement>(null);

  const filteredPOIs = useMemo(() => {
    const q = query.toLowerCase().trim();
    return ALL_POIS.filter((poi) => {
      const matchesCat = selectedCategory === 'all' || poi.category === selectedCategory;
      const matchesQuery =
        !q ||
        poi.name.toLowerCase().includes(q) ||
        poi.roomName.toLowerCase().includes(q) ||
        (poi.description && poi.description.toLowerCase().includes(q)) ||
        poi.id.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [query, selectedCategory]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectPOI = (poi: POI) => {
    setDestination(poi);
    setQuery(poi.name);
    setIsOpen(false);

    // Calculate A* path immediately
    const path = findPath(userPosition[0], userPosition[2], poi.position[0], poi.position[2]);
    if (path.length >= 2) {
      const { directions, totalDistance } = generateTurnDirections(path, poi);
      setNavigationRoute(path, directions, totalDistance);
    }
  };

  const handleClear = () => {
    setQuery('');
    clearNavigation();
  };

  const getCategoryIcon = (cat: POI['category']) => {
    switch (cat) {
      case 'room':
        return <School className="w-3.5 h-3.5 text-cyan-400" />;
      case 'workstation':
        return <Monitor className="w-3.5 h-3.5 text-cyan-400" />;
      case 'faculty':
        return <Coffee className="w-3.5 h-3.5 text-amber-400" />;
      case 'exit':
        return <ShieldAlert className="w-3.5 h-3.5 text-red-400" />;
      default:
        return <MapPin className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  return (
    <div ref={containerRef} className="relative w-64 sm:w-80 md:w-96 select-none pointer-events-auto">
      {/* Search Input Box */}
      <div className="relative flex items-center rounded-2xl bg-[rgba(15,17,20,0.6)] backdrop-blur-md border border-white/10 shadow-xl focus-within:border-cyan-400/80 transition-all">
        <Search className="w-4 h-4 ml-3 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search Lab, PC-17, HOD, Washroom, Exit..."
          className="w-full py-2 px-2.5 bg-transparent text-xs md:text-sm text-slate-100 placeholder-slate-400 outline-none"
        />
        {query && (
          <button
            onClick={handleClear}
            className="p-1.5 mr-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl bg-[rgba(15,17,20,0.9)] backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 max-h-80 flex flex-col">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 p-2 bg-black/40 border-b border-white/5 overflow-x-auto text-[11px]">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'room', label: 'Rooms' },
                { id: 'workstation', label: 'Workstations' },
                { id: 'faculty', label: 'Faculty' },
                { id: 'exit', label: 'Exits' },
              ] as const
            ).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Result List */}
          <div className="overflow-y-auto divide-y divide-white/5">
            {filteredPOIs.length > 0 ? (
              filteredPOIs.slice(0, 15).map((poi) => (
                <div
                  key={poi.id}
                  onClick={() => handleSelectPOI(poi)}
                  className="flex items-center justify-between p-2.5 hover:bg-slate-800/60 cursor-pointer group transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-lg bg-black/40 border border-white/5">
                      {getCategoryIcon(poi.category)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-400 truncate flex items-center gap-1.5">
                        {poi.name}
                        {poi.isEmergency && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-red-500/20 text-red-400 border border-red-500/30">
                            Emergency
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {poi.description || poi.roomName}
                      </div>
                    </div>
                  </div>

                  <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-slate-500">
                No matching locations or workstations found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
