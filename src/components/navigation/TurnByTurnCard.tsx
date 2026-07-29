import React from 'react';
import { useDrive } from '../../context/DriveContext';
import { Navigation, Play, Pause, FastForward, Clock, Gauge } from 'lucide-react';

export const TurnByTurnCard: React.FC = () => {
  const { 
    currentRoute, 
    currentStepIndex, 
    isSimulatingNav, 
    toggleSimulation, 
    simulatedSpeedKmH,
    driveDurationHours
  } = useDrive();

  if (!currentRoute) return null;

  const currentStep = currentRoute.steps[Math.min(currentStepIndex, currentRoute.steps.length - 1)];

  return (
    <div className="glass-panel p-4 rounded-2xl border border-cyan-500/30 flex flex-col gap-3 shadow-xl">
      {/* Top Route Overview Stats */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs">
        <div className="flex items-center gap-2 text-cyan-300 font-bold">
          <Navigation className="w-4 h-4 text-cyan-400" />
          <span>{currentRoute.distanceKm} km</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300 font-normal">{currentRoute.durationMinutes} mins</span>
        </div>

        {/* Live Simulation Speedometer Badge */}
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-cyan-400 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800">
          <Gauge className="w-3.5 h-3.5 text-cyan-400" />
          <span>{simulatedSpeedKmH} km/h</span>
        </div>
      </div>

      {/* Current Turn Instruction */}
      {currentStep && (
        <div className="flex items-start gap-3 bg-slate-900/70 p-3 rounded-xl border border-slate-800">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center shrink-0">
            <Navigation className="w-5 h-5 text-cyan-400 transform -rotate-45" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-semibold text-slate-100 leading-snug">
              {currentStep.instruction}
            </h4>
            <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400 font-mono">
              <span>{currentStep.distance}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-cyan-400" />
                {currentStep.duration}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Driver Simulation Play/Pause Controls */}
      <div className="flex items-center justify-between text-xs pt-1">
        <div className="flex items-center gap-2 text-slate-400 text-[11px] font-mono">
          <span>Continuous Drive:</span>
          <span className="text-cyan-300 font-bold">{driveDurationHours.toFixed(1)} hrs</span>
        </div>

        <button
          onClick={toggleSimulation}
          className={`px-3.5 py-1.5 rounded-xl font-medium text-xs flex items-center gap-2 border transition-all ${
            isSimulatingNav
              ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(255,184,0,0.3)]'
              : 'bg-cyan-500/20 border-cyan-400 text-cyan-300 hover:bg-cyan-500/30'
          }`}
        >
          {isSimulatingNav ? (
            <>
              <Pause className="w-3.5 h-3.5" />
              <span>Pause Drive Sim</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              <span>Simulate Live Drive</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
