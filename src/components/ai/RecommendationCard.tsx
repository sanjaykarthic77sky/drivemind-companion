import React from 'react';
import { Recommendation } from '../../types/infotainment';
import { useDrive } from '../../context/DriveContext';
import { Sparkles, ArrowRight, ShieldAlert, CheckCircle2, BookOpen, Coffee, Fuel, Hospital, Navigation } from 'lucide-react';

interface Props {
  recommendation: Recommendation;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  REROUTE: <Navigation className="w-4 h-4 text-cyan-400" />,
  REST_STOP: <Coffee className="w-4 h-4 text-amber-400" />,
  FUEL_EV: <Fuel className="w-4 h-4 text-emerald-400" />,
  HOSPITAL: <Hospital className="w-4 h-4 text-red-400" />,
  SAFETY: <ShieldAlert className="w-4 h-4 text-sky-400" />,
  WEATHER: <ShieldAlert className="w-4 h-4 text-cyan-300" />
};

export const RecommendationCard: React.FC<Props> = ({ recommendation }) => {
  const { applyRecommendation, dismissRecommendation } = useDrive();

  const isUrgent = recommendation.urgency === 'CRITICAL' || recommendation.urgency === 'HIGH';

  return (
    <div className={`p-4 rounded-2xl border transition-all glass-panel ${
      isUrgent
        ? 'border-amber-500/50 bg-amber-950/20 shadow-[0_0_20px_rgba(255,184,0,0.15)]'
        : 'border-cyan-500/25 bg-slate-900/60 hover:border-cyan-400/50'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
            {CATEGORY_ICONS[recommendation.category] || <Sparkles className="w-4 h-4 text-cyan-400" />}
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-100 leading-snug">
              {recommendation.title}
            </h4>
            {recommendation.impactText && (
              <span className="text-[10px] font-mono text-cyan-300 font-semibold bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-500/30">
                {recommendation.impactText}
              </span>
            )}
          </div>
        </div>

        {/* Urgency Badge */}
        <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-md border ${
          recommendation.urgency === 'CRITICAL'
            ? 'bg-red-500/20 border-red-500/50 text-red-400 animate-pulse'
            : recommendation.urgency === 'HIGH'
            ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
            : 'bg-cyan-950/40 border-cyan-500/30 text-cyan-400'
        }`}>
          {recommendation.urgency}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
        {recommendation.description}
      </p>

      {/* Knowledge Layer Citation */}
      {recommendation.knowledgeCitation && (
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-start gap-1.5 text-[10px] text-slate-400 font-mono">
          <BookOpen className="w-3 h-3 text-cyan-400 shrink-0 mt-0.5" />
          <span>Knowledge Citation: {recommendation.knowledgeCitation}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          onClick={() => dismissRecommendation(recommendation.id)}
          className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          Dismiss
        </button>

        <button
          onClick={() => applyRecommendation(recommendation.id)}
          disabled={recommendation.applied}
          className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 border ${
            recommendation.applied
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 cursor-default'
              : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black border-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
          }`}
        >
          {recommendation.applied ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Applied</span>
            </>
          ) : (
            <>
              <span>{recommendation.actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
