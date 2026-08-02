import React from 'react';
import { useDrive } from '../../context/DriveContext';
import { Navigation, Bot, Siren, Flag, Mic, MicOff, Music } from 'lucide-react';

export const BottomDock: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    recommendations, 
    triggerSOS, 
    finishTrip,
    isVoiceActive,
    toggleVoiceListening,
    isPlaying
  } = useDrive();

  const urgentCount = recommendations.filter(r => r.urgency === 'HIGH' || r.urgency === 'CRITICAL').length;

  return (
    <div className="bg-[#080B12]/95 border-t border-cyan-500/20 px-8 py-3 flex items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.8)] z-30 flex-wrap gap-2">
      {/* Navigation View */}
      <button
        onClick={() => setActiveTab('nav')}
        className={`flex flex-col items-center gap-1.5 px-5 py-2 rounded-xl transition-all ${
          activeTab === 'nav'
            ? 'bg-gradient-to-t from-cyan-600/30 to-cyan-500/10 text-cyan-300 border border-cyan-400/40 shadow-[0_0_20px_rgba(0,240,255,0.25)]'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
        }`}
      >
        <Navigation className="w-5 h-5" />
        <span className="text-xs font-medium tracking-wide">Navigation</span>
      </button>

      {/* AI Companion & Proactive Feed */}
      <button
        onClick={() => setActiveTab('ai')}
        className={`relative flex flex-col items-center gap-1.5 px-5 py-2 rounded-xl transition-all ${
          activeTab === 'ai'
            ? 'bg-gradient-to-t from-cyan-600/30 to-cyan-500/10 text-cyan-300 border border-cyan-400/40 shadow-[0_0_20px_rgba(0,240,255,0.25)]'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
        }`}
      >
        <Bot className="w-5 h-5 text-cyan-400" />
        <span className="text-xs font-medium tracking-wide">AI Recommendations</span>
        {urgentCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-cyan-500 text-black text-[10px] font-extrabold flex items-center justify-center animate-pulse">
            {urgentCount}
          </span>
        )}
      </button>

      {/* Device Music Player */}
      <button
        onClick={() => setActiveTab('music')}
        className={`relative flex flex-col items-center gap-1.5 px-5 py-2 rounded-xl transition-all ${
          activeTab === 'music'
            ? 'bg-gradient-to-t from-cyan-600/30 to-cyan-500/10 text-cyan-300 border border-cyan-400/40 shadow-[0_0_20px_rgba(0,240,255,0.25)]'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
        }`}
      >
        <Music className="w-5 h-5 text-cyan-400" />
        <span className="text-xs font-medium tracking-wide flex items-center gap-1">
          Music & Media
          {isPlaying && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />}
        </span>
      </button>

      {/* Voice Assistant Mic Button */}
      <button
        onClick={toggleVoiceListening}
        className={`w-13 h-13 rounded-full flex items-center justify-center transition-all border shadow-lg ${
          isVoiceActive
            ? 'bg-red-500/20 border-red-400 text-red-400 animate-pulse shadow-[0_0_25px_rgba(255,42,109,0.5)]'
            : 'bg-gradient-to-br from-cyan-500 to-blue-600 border-cyan-300 text-black hover:scale-105 shadow-[0_0_20px_rgba(0,240,255,0.4)]'
        }`}
        title="Toggle Hands-Free Voice Assistant"
      >
        {isVoiceActive ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6 font-bold" />}
      </button>

      {/* Emergency SOS Mode Button */}
      <button
        onClick={triggerSOS}
        className="flex flex-col items-center gap-1.5 px-5 py-2 rounded-xl bg-red-950/40 border border-red-500/40 text-red-400 hover:bg-red-900/50 hover:border-red-400 transition-all shadow-[0_0_15px_rgba(255,42,109,0.2)]"
      >
        <Siren className="w-5 h-5 animate-pulse" />
        <span className="text-xs font-bold tracking-wide text-red-300">Emergency SOS</span>
      </button>

      {/* End of Trip Summary */}
      <button
        onClick={finishTrip}
        className="flex flex-col items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50 hover:border-emerald-400 transition-all"
      >
        <Flag className="w-5 h-5 text-emerald-400" />
        <span className="text-xs font-medium tracking-wide">Trip Summary</span>
      </button>
    </div>
  );
};
