import React, { useState } from 'react';
import { useDrive } from '../../context/DriveContext';
import { TopStatusBar } from './TopStatusBar';
import { BottomDock } from './BottomDock';
import { ScenarioBar } from '../scenarios/ScenarioBar';
import { MapView } from '../navigation/MapView';
import { RouteSearchBar } from '../navigation/RouteSearchBar';
import { TurnByTurnCard } from '../navigation/TurnByTurnCard';
import { AICompanionPanel } from '../ai/AICompanionPanel';
import { MusicPlayerPanel } from '../music/MusicPlayerPanel';
import { ChatbotWidget } from '../ai/ChatbotWidget';
import { EmergencySOSModal } from '../sos/EmergencySOSModal';
import { JourneySummaryModal } from '../summary/JourneySummaryModal';
import { ApiKeySettingsModal } from '../settings/ApiKeySettingsModal';
import { FutureLearningModal } from '../settings/FutureLearningModal';
import { MessageSquare, X } from 'lucide-react';

export const CockpitLayout: React.FC = () => {
  const { activeTab, isSOSOpen, isSummaryOpen } = useDrive();
  const [isFloatingChatOpen, setIsFloatingChatOpen] = useState(false);

  return (
    <div className="w-screen h-screen bg-[#05070C] text-slate-100 flex flex-col justify-between overflow-hidden relative font-sans select-none">
      {/* Top Scenario Simulator Quick Bar */}
      <ScenarioBar />

      {/* Automotive Telemetry Status Bar */}
      <TopStatusBar />

      {/* Main Infotainment Display Stage Area */}
      <main className="flex-1 p-4 overflow-hidden relative">
        {activeTab === 'music' ? (
          <div className="w-full h-full">
            <MusicPlayerPanel />
          </div>
        ) : (
          <div className="w-full h-full grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left / Primary Navigation Display Area (8 Columns on desktop) */}
            <div className="lg:col-span-8 h-full flex flex-col gap-3 relative">
              <RouteSearchBar />
              
              <div className="flex-1 relative overflow-hidden">
                <MapView />
              </div>

              <TurnByTurnCard />
            </div>

            {/* Right / AI Companion & Context Intelligence Panel (4 Columns on desktop) */}
            <div className={`lg:col-span-4 h-full relative transition-all ${
              activeTab === 'ai' ? 'block' : 'hidden lg:block'
            }`}>
              <AICompanionPanel />
            </div>
          </div>
        )}
      </main>

      {/* Bottom Touchscreen Control Dock */}
      <BottomDock />

      {/* Floating AI Chatbot Button (Bottom Right) */}
      <button
        onClick={() => setIsFloatingChatOpen(prev => !prev)}
        className="fixed bottom-20 right-6 z-40 w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 border-2 border-white text-black font-bold flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.5)] hover:scale-110 transition-all"
        title="Open DriveMind AI Chatbot"
      >
        {isFloatingChatOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>

      {/* Floating AI Chatbot Drawer/Modal Window */}
      {isFloatingChatOpen && (
        <div className="fixed bottom-36 right-6 z-40 w-96 h-[500px] max-w-[calc(100vw-3rem)] rounded-2xl shadow-2xl overflow-hidden border border-cyan-400/40 bg-[#080C16] animate-in fade-in slide-in-from-bottom-4 duration-200">
          <ChatbotWidget />
        </div>
      )}

      {/* Modals & Overlays */}
      {isSOSOpen && <EmergencySOSModal />}
      {isSummaryOpen && <JourneySummaryModal />}
      <ApiKeySettingsModal />
      <FutureLearningModal />
    </div>
  );
};
