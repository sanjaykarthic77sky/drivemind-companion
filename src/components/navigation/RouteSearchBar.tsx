import React, { useState, useEffect, useRef } from 'react';
import { useDrive } from '../../context/DriveContext';
import { MapsService } from '../../services/mapsService';
import { LocationPoint } from '../../types/infotainment';
import { Search, MapPin, ArrowRight, Compass, Loader2 } from 'lucide-react';

const PRESET_ROUTES = [
  { label: 'Chennai → Bengaluru', source: 'Chennai', dest: 'Bengaluru' },
  { label: 'Delhi → Jaipur', source: 'Delhi', dest: 'Jaipur' },
  { label: 'Madurai → Coimbatore', source: 'Madurai', dest: 'Coimbatore' },
  { label: 'Kolkata → Bhubaneswar', source: 'Kolkata', dest: 'Bhubaneswar' },
  { label: 'Kashmir → Kanyakumari', source: 'Kashmir', dest: 'Kanyakumari' },
  { label: 'Mumbai → Pune', source: 'Mumbai', dest: 'Pune' },
  { label: 'Hyderabad → Kochi', source: 'Hyderabad', dest: 'Kochi' },
];

export const RouteSearchBar: React.FC = () => {
  const { currentRoute, calculateNewRoute, isLoading } = useDrive();

  const [sourceText, setSourceText] = useState(currentRoute?.source.name || 'Chennai');
  const [destText, setDestText] = useState(currentRoute?.destination.name || 'Bengaluru');
  const [sourceSugg, setSourceSugg] = useState<LocationPoint[]>([]);
  const [destSugg, setDestSugg] = useState<LocationPoint[]>([]);
  const [focusField, setFocusField] = useState<'source' | 'dest' | null>(null);
  const sourceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const destTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep input text synced with currentRoute when not actively focused
  useEffect(() => {
    if (currentRoute) {
      if (focusField !== 'source') setSourceText(currentRoute.source.name);
      if (focusField !== 'dest') setDestText(currentRoute.destination.name);
    }
  }, [currentRoute, focusField]);

  // Live autocomplete – source
  useEffect(() => {
    if (sourceTimer.current) clearTimeout(sourceTimer.current);
    if (sourceText.trim().length < 2 || focusField !== 'source') {
      setSourceSugg([]);
      return;
    }
    sourceTimer.current = setTimeout(async () => {
      const results = await MapsService.fetchLocationSuggestions(sourceText);
      setSourceSugg(results);
    }, 300);
  }, [sourceText, focusField]);

  // Live autocomplete – destination
  useEffect(() => {
    if (destTimer.current) clearTimeout(destTimer.current);
    if (destText.trim().length < 2 || focusField !== 'dest') {
      setDestSugg([]);
      return;
    }
    destTimer.current = setTimeout(async () => {
      const results = await MapsService.fetchLocationSuggestions(destText);
      setDestSugg(results);
    }, 300);
  }, [destText, focusField]);

  const doSearch = async (src = sourceText, dst = destText) => {
    if (!src.trim() || !dst.trim()) return;
    setFocusField(null);
    setSourceSugg([]);
    setDestSugg([]);
    await calculateNewRoute(src.trim(), dst.trim());
  };

  const pickSource = (loc: LocationPoint) => {
    setSourceText(loc.name);
    setSourceSugg([]);
    setFocusField(null);
  };

  const pickDest = (loc: LocationPoint) => {
    setDestText(loc.name);
    setDestSugg([]);
    setFocusField(null);
  };

  const handlePreset = async (src: string, dst: string) => {
    setSourceText(src);
    setDestText(dst);
    await doSearch(src, dst);
  };

  return (
    <div className="glass-panel p-4 rounded-2xl border border-cyan-500/30 flex flex-col gap-3 relative z-30">
      {/* Main Search Row */}
      <form
        onSubmit={e => { e.preventDefault(); doSearch(); }}
        className="flex items-stretch gap-3"
      >
        {/* Source */}
        <div className="flex-1 relative">
          <div className="flex items-center relative">
            <MapPin className="w-4 h-4 text-emerald-400 absolute left-3 pointer-events-none z-10" />
            <input
              type="text"
              value={sourceText}
              onFocus={() => setFocusField('source')}
              onBlur={() => setTimeout(() => setSourceSugg([]), 200)}
              onChange={e => setSourceText(e.target.value)}
              placeholder="From: Any city, area, landmark in India..."
              className="w-full pl-9 pr-3 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50"
            />
          </div>
          {sourceSugg.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#0D1525] border border-cyan-500/40 rounded-xl overflow-hidden shadow-2xl z-50 max-h-52 overflow-y-auto">
              {sourceSugg.map((item, i) => (
                <button
                  key={i}
                  type="button"
                  onMouseDown={() => pickSource(item)}
                  className="w-full px-3 py-2.5 text-left flex flex-col gap-0.5 hover:bg-cyan-500/15 border-b border-slate-800/60 transition-colors"
                >
                  <span className="text-xs font-bold text-cyan-300">{item.name}</span>
                  <span className="text-[10px] text-slate-400 truncate">{item.address}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center shrink-0 text-cyan-500">
          <ArrowRight className="w-5 h-5" />
        </div>

        {/* Destination */}
        <div className="flex-1 relative">
          <div className="flex items-center relative">
            <MapPin className="w-4 h-4 text-cyan-400 absolute left-3 pointer-events-none z-10" />
            <input
              type="text"
              value={destText}
              onFocus={() => setFocusField('dest')}
              onBlur={() => setTimeout(() => setDestSugg([]), 200)}
              onChange={e => setDestText(e.target.value)}
              placeholder="To: Any city, area, landmark in India..."
              className="w-full pl-9 pr-3 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50"
            />
          </div>
          {destSugg.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#0D1525] border border-cyan-500/40 rounded-xl overflow-hidden shadow-2xl z-50 max-h-52 overflow-y-auto">
              {destSugg.map((item, i) => (
                <button
                  key={i}
                  type="button"
                  onMouseDown={() => pickDest(item)}
                  className="w-full px-3 py-2.5 text-left flex flex-col gap-0.5 hover:bg-cyan-500/15 border-b border-slate-800/60 transition-colors"
                >
                  <span className="text-xs font-bold text-cyan-300">{item.name}</span>
                  <span className="text-[10px] text-slate-400 truncate">{item.address}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Calculate Route Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs rounded-xl shadow-[0_0_18px_rgba(0,240,255,0.35)] transition-all flex items-center gap-2 shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Search className="w-4 h-4" />}
          <span>{isLoading ? 'Routing…' : 'Get Route'}</span>
        </button>
      </form>

      {/* Route Info Banner (shows after route is calculated) */}
      {currentRoute && !isLoading && (
        <div className="flex items-center gap-4 px-1 text-xs flex-wrap">
          <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
            <span className="text-lg">{currentRoute.distanceKm}</span>
            <span className="text-slate-400 font-normal">km</span>
          </div>
          <div className="w-px h-4 bg-slate-700" />
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="font-bold text-slate-100">{currentRoute.durationMinutes} mins</span>
            <span className="text-slate-400">estimated drive time</span>
          </div>
          <div className="w-px h-4 bg-slate-700" />
          <div className={`flex items-center gap-1.5 font-semibold text-[11px] px-2 py-0.5 rounded-full border ${
            currentRoute.trafficCondition === 'Heavy Congestion'
              ? 'text-red-400 border-red-500/40 bg-red-950/30'
              : currentRoute.trafficCondition === 'Moderate'
              ? 'text-amber-300 border-amber-500/40 bg-amber-950/30'
              : 'text-emerald-300 border-emerald-500/40 bg-emerald-950/30'
          }`}>
            {currentRoute.trafficCondition}
          </div>
          {currentRoute.savingsMinutes && (
            <>
              <div className="w-px h-4 bg-slate-700" />
              <div className="text-emerald-400 font-bold text-[11px] bg-emerald-950/30 px-2 py-0.5 rounded-full border border-emerald-500/40">
                ✓ Bypass saves {currentRoute.savingsMinutes} mins
              </div>
            </>
          )}
        </div>
      )}

      {/* Preset Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pt-0.5 no-scrollbar">
        <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider flex items-center gap-1 shrink-0">
          <Compass className="w-3 h-3 text-cyan-400" /> Quick:
        </span>
        {PRESET_ROUTES.map((p, i) => (
          <button
            key={i}
            type="button"
            disabled={isLoading}
            onClick={() => handlePreset(p.source, p.dest)}
            className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-cyan-500/20 border border-slate-800 hover:border-cyan-400/50 text-[11px] text-slate-300 hover:text-cyan-200 transition-all whitespace-nowrap disabled:opacity-50"
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
};
