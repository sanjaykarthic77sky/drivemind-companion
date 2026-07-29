import React from 'react';
import { useDrive } from '../../context/DriveContext';
import { LearningEngine } from '../../services/learningEngine';
import { Sparkles, X, Brain, CheckCircle2, UserCheck } from 'lucide-react';

export const FutureLearningModal: React.FC = () => {
  const { isLearningModalOpen, setIsLearningModalOpen, userProfile } = useDrive();

  if (!isLearningModalOpen) return null;

  const futureCapabilities = LearningEngine.getFutureLearningCapabilities();

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-fadeIn">
      <div className="w-full max-w-xl glass-panel-accent p-6 rounded-3xl border border-indigo-500/40 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center">
              <Brain className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Learning Engine Architecture
              </h2>
              <span className="text-[10px] text-indigo-300 font-mono">Future Enhancement Blueprint (v2.0 Post-SIH)</span>
            </div>
          </div>
          <button onClick={() => setIsLearningModalOpen(false)} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current MVP User Profile Mock */}
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
            <UserCheck className="w-4 h-4 text-indigo-400" />
            <span>Driver Preference Profile (MVP Active)</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs text-slate-300 font-mono mt-1">
            <div>
              <span className="text-[10px] text-slate-500 block">PREFERRED ROUTE:</span>
              <span className="text-cyan-300 font-bold">{userProfile.preferredRouteStyle}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">FATIGUE THRESHOLD:</span>
              <span className="text-cyan-300 font-bold">{userProfile.fatigueWarningThresholdHours} hrs</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">COMPLETED TRIPS:</span>
              <span className="text-cyan-300 font-bold">{userProfile.totalTripsCompleted}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">TOTAL DISTANCE:</span>
              <span className="text-cyan-300 font-bold">{userProfile.totalDistanceKm} km</span>
            </div>
          </div>
        </div>

        {/* Future Enhancement Capabilities List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Personalization Roadmap:
          </h3>

          <div className="space-y-2.5">
            {futureCapabilities.map((cap, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-100">{cap.feature}</h4>
                    <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                      {cap.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{cap.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={() => setIsLearningModalOpen(false)}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all"
          >
            Close Blueprint
          </button>
        </div>
      </div>
    </div>
  );
};
