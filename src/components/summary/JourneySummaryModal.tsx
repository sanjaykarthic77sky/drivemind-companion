import React, { useEffect } from 'react';
import { useDrive } from '../../context/DriveContext';
import confetti from 'canvas-confetti';
import { Flag, MapPin, Clock, ShieldCheck, Cloud, Sparkles, X, CheckCircle2 } from 'lucide-react';

export const JourneySummaryModal: React.FC = () => {
  const { currentRoute, activeScenario, weather, recommendations, isSummaryOpen, setActiveTab } = useDrive();

  useEffect(() => {
    if (isSummaryOpen) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    }
  }, [isSummaryOpen]);

  if (!isSummaryOpen || !currentRoute) return null;

  const handleClose = () => {
    setActiveTab('nav');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 animate-fadeIn">
      <div className="w-full max-w-3xl glass-panel-accent border border-cyan-500/40 rounded-3xl p-6 shadow-[0_0_50px_rgba(0,240,255,0.3)] overflow-y-auto max-h-[90vh] flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(0,255,157,0.4)]">
              <Flag className="w-6 h-6 text-black font-bold" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 tracking-wider">
                JOURNEY COMPLETED SUMMARY
              </h2>
              <p className="text-xs text-cyan-300 font-mono">
                {currentRoute.source.name} → {currentRoute.destination.name}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-full bg-slate-900 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Core Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Total Distance */}
          <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col gap-1">
            <span className="text-[10px] text-slate-400 font-mono uppercase">Total Distance</span>
            <div className="text-xl font-extrabold text-cyan-300 flex items-baseline gap-1">
              <span>{currentRoute.distanceKm}</span>
              <span className="text-xs font-normal text-slate-400">km</span>
            </div>
          </div>

          {/* Travel Time */}
          <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col gap-1">
            <span className="text-[10px] text-slate-400 font-mono uppercase">Travel Time</span>
            <div className="text-xl font-extrabold text-cyan-300 flex items-baseline gap-1">
              <span>{currentRoute.durationMinutes}</span>
              <span className="text-xs font-normal text-slate-400">mins</span>
            </div>
          </div>

          {/* Traffic Encountered */}
          <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col gap-1">
            <span className="text-[10px] text-slate-400 font-mono uppercase">Traffic Level</span>
            <div className="text-sm font-bold text-amber-300 mt-1">
              {activeScenario.trafficLevel}
            </div>
          </div>

          {/* Weather Conditions */}
          <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col gap-1">
            <span className="text-[10px] text-slate-400 font-mono uppercase">Weather</span>
            <div className="text-xs font-bold text-cyan-300 mt-1 truncate">
              {weather.tempC}°C • {weather.condition}
            </div>
          </div>
        </div>

        {/* Route Overview Details */}
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex flex-col gap-3 text-xs">
          <h3 className="font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            Route Overview & Corridor
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300 font-mono">
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">ORIGIN:</span>
              <span className="font-bold text-slate-100">{currentRoute.source.name}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">{currentRoute.source.address}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">DESTINATION:</span>
              <span className="font-bold text-cyan-300">{currentRoute.destination.name}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">{currentRoute.destination.address}</span>
            </div>
          </div>
        </div>

        {/* AI Recommendations Delivered */}
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex flex-col gap-3 text-xs">
          <h3 className="font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            AI Proactive Recommendations Delivered
          </h3>

          <div className="space-y-2">
            {recommendations.map(rec => (
              <div key={rec.id} className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-100">{rec.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{rec.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleClose}
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-extrabold text-xs rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:scale-105 transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
