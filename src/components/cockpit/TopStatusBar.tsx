import React, { useState, useEffect } from 'react';
import { useDrive } from '../../context/DriveContext';
import { Wifi, Key, Cloud, ShieldAlert, Cpu } from 'lucide-react';

export const TopStatusBar: React.FC = () => {
  const { weather, contextEvents, setIsApiKeyModalOpen } = useDrive();
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const criticalEvent = contextEvents.find(e => e.severity === 'critical');
  const warningEvent = contextEvents.find(e => e.severity === 'warning');

  return (
    <div className="bg-[#080B12]/95 border-b border-cyan-500/20 px-6 py-2.5 flex items-center justify-between text-xs tracking-wide">
      {/* Left Branding & Live Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-[0_0_12px_rgba(0,240,255,0.4)]">
            <Cpu className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm bg-gradient-to-r from-cyan-300 via-sky-200 to-blue-400 bg-clip-text text-transparent tracking-wider">
              DRIVEMIND <span className="text-cyan-400 font-extrabold">AI</span>
            </h1>
            <p className="text-[10px] text-cyan-400/70 font-mono leading-none uppercase">Context Intelligence System</p>
          </div>
        </div>

        <div className="h-5 w-[1px] bg-slate-800 hidden sm:block" />

        {/* Priority Status Badge */}
        {criticalEvent ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/50 text-red-400 animate-pulse font-medium">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>CRITICAL ALERT ACTIVE</span>
          </div>
        ) : warningEvent ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>{warningEvent.title}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-300">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00F0FF]" />
            <span>AI Monitoring Active</span>
          </div>
        )}
      </div>

      {/* Right Telemetry Controls */}
      <div className="flex items-center gap-4 text-slate-300">
        {/* Weather Indicator */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
          <Cloud className="w-3.5 h-3.5 text-cyan-400" />
          <span>{weather.locationName}: {weather.tempC}°C ({weather.condition})</span>
        </div>

        {/* Maps API Key Button */}
        <button
          onClick={() => setIsApiKeyModalOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/40 transition-all"
        >
          <Key className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden md:inline">Google Maps Key</span>
        </button>

        {/* Clock & Signal */}
        <div className="flex items-center gap-2 font-mono text-cyan-300 font-semibold bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
          <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          <span>{timeStr}</span>
        </div>
      </div>
    </div>
  );
};
