import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X, MapPin, Compass, ArrowUpRight, Monitor, School, ShieldAlert, Coffee } from 'lucide-react';
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
  const activeDestination = useStore((s) => s.activeDestination);
  const setDestination = useStore((s) => s.setDestination);
  const setNavigationRoute = useStore((s) => s.setNavigationRoute);
  const clearNavigation = useStore((s) => s.clearNavigation);
  const customPOIs = useStore((s) => s.customPOIs);

  const containerRef = useRef<HTMLDivElement>(null);

  // Combine static POIs with user-created custom POIs
  const combinedPOIs = useMemo(() => {
    return [...ALL_POIS, ...customPOIs];
  }, [customPOIs]);

  // Filtered POIs based on query and category
  const filteredPOIs = useMemo(() => {
    const q = query.toLowerCase().trim();
    return combinedPOIs.filter((poi) => {
      const matchesCat = selectedCategory === 'all' || poi.category === selectedCategory;
      const matchesQuery =
        !q ||
        poi.name.toLowerCase().includes(q) ||
        poi.roomName.toLowerCase().includes(q) ||
        (poi.description && poi.description.toLowerCase().includes(q)) ||
        poi.id.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [combinedPOIs, query, selectedCategory]);

  // Close dropdown when clicking outside
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
        return <School className="w-4 h-4 text-sky-400" />;
      case 'workstation':
        return <Monitor className="w-4 h-4 text-emerald-400" />;
      case 'faculty':
        return <Coffee className="w-4 h-4 text-amber-400" />;
      case 'exit':
        return <ShieldAlert className="w-4 h-4 text-red-400" />;
      default:
        return <MapPin className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div ref={containerRef} className="relative w-72 md:w-96 select-none pointer-events-auto">
      {/* Search Input Box */}
      <div className="relative flex items-center glass-panel rounded-xl border border-slate-700/80 shadow-xl focus-within:border-emerald-500/80 focus-within:ring-1 focus-within:ring-emerald-500/30 transition-all">
        <Search className="w-4 h-4 ml-3 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search Lab, PC-17, HOD, Exit..."
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
        <div className="absolute left-0 right-0 top-full mt-2 glass-panel-glow rounded-xl border border-slate-700/80 shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 max-h-80 flex flex-col">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 p-2 bg-slate-900/90 border-b border-slate-800 overflow-x-auto text-[11px]">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'room', label: 'Rooms' },
                { id: 'workstation', label: 'PCs' },
                { id: 'faculty', label: 'Faculty' },
                { id: 'exit', label: 'Exits' },
              ] as const
            ).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Result List */}
          <div className="overflow-y-auto divide-y divide-slate-800/50">
            {filteredPOIs.length > 0 ? (
              filteredPOIs.slice(0, 15).map((poi) => (
                <div
                  key={poi.id}
                  onClick={() => handleSelectPOI(poi)}
                  className="flex items-center justify-between p-2.5 hover:bg-slate-800/80 cursor-pointer group transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 group-hover:border-slate-700">
                      {getCategoryIcon(poi.category)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-emerald-400 truncate flex items-center gap-1.5">
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

                  <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
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
