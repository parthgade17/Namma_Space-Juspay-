import React, { useEffect } from 'react';
import { useStore } from '../state/useStore';
import { CheckCircle2, X } from 'lucide-react';

export const ArrivalToast: React.FC = () => {
  const arrivalToast = useStore((s) => s.arrivalToast);
  const setArrivalToast = useStore((s) => s.setArrivalToast);

  useEffect(() => {
    if (arrivalToast) {
      const timer = setTimeout(() => {
        setArrivalToast(null);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [arrivalToast, setArrivalToast]);

  if (!arrivalToast) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-auto select-none animate-in fade-in slide-in-from-top-4 duration-200">
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[rgba(15,17,20,0.9)] backdrop-blur-xl border border-cyan-500/40 text-slate-100 shadow-2xl shadow-cyan-500/20">
        <div className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-400">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div className="text-xs md:text-sm font-bold text-white tracking-tight">
          {arrivalToast}
        </div>
        <button
          onClick={() => setArrivalToast(null)}
          className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors ml-2"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
