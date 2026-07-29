import React, { useState } from 'react';
import { useDrive } from '../../context/DriveContext';
import { RecommendationCard } from './RecommendationCard';
import { ChatbotWidget } from './ChatbotWidget';
import { Cpu, ShieldCheck, Sparkles, AlertCircle, Bot, ListFilter, MessageSquare } from 'lucide-react';

export const AICompanionPanel: React.FC = () => {
  const { recommendations, contextEvents, decisions, activeScenario } = useDrive();
  const [panelTab, setPanelTab] = useState<'feed' | 'chat'>('feed');

  return (
    <div className="h-full flex flex-col glass-panel rounded-2xl border border-cyan-500/30 overflow-hidden shadow-2xl">
      {/* Header with Tab Switcher */}
      <div className="p-3.5 border-b border-cyan-500/20 bg-slate-950/90 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.3)]">
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              DriveMind AI Engine
            </h3>
            <p className="text-[10px] text-cyan-400/80 font-mono">
              {contextEvents.length} Events • {decisions.length} Decisions
            </p>
          </div>
        </div>

        {/* Tab Toggle: Proactive Feed vs Interactive AI Chatbot */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-[11px] font-medium">
          <button
            onClick={() => setPanelTab('feed')}
            className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
              panelTab === 'feed'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListFilter className="w-3 h-3" />
            <span>Feed</span>
          </button>

          <button
            onClick={() => setPanelTab('chat')}
            className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
              panelTab === 'chat'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3 h-3 text-cyan-400" />
            <span>Chat AI</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-hidden relative">
        {panelTab === 'feed' ? (
          <div className="h-full flex flex-col">
            <div className="flex-1 p-4 overflow-y-auto space-y-3 no-scrollbar">
              {recommendations.length > 0 ? (
                recommendations.map(rec => (
                  <RecommendationCard key={rec.id} recommendation={rec} />
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <ShieldCheck className="w-12 h-12 text-cyan-400/40 mb-2" />
                  <p className="text-xs font-semibold text-slate-300">All Systems Optimal</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Context Intelligence Engine is continuously monitoring traffic, weather, and driving duration.
                  </p>
                </div>
              )}
            </div>

            {/* Footer Info */}
            <div className="p-3 bg-slate-950/90 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between font-mono">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                Scenario: {activeScenario.title}
              </span>
              <span className="flex items-center gap-1 text-cyan-300">
                <AlertCircle className="w-3 h-3 text-cyan-400" />
                Distraction Filter: Active
              </span>
            </div>
          </div>
        ) : (
          <ChatbotWidget />
        )}
      </div>
    </div>
  );
};
