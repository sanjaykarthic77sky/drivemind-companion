import React from 'react';
import { useDrive } from '../../context/DriveContext';
import { ScenarioSimulator } from '../../services/scenarioSimulator';
import { ScenarioType } from '../../types/infotainment';
import { Briefcase, AlertTriangle, Moon, CloudRain, Compass, Siren } from 'lucide-react';

const SCENARIO_ICONS: Record<ScenarioType, React.ReactNode> = {
  office_commute: <Briefcase className="w-4 h-4" />,
  heavy_traffic: <AlertTriangle className="w-4 h-4 text-amber-400" />,
  night_driving: <Moon className="w-4 h-4 text-indigo-400" />,
  heavy_rain: <CloudRain className="w-4 h-4 text-cyan-400" />,
  highway_trip: <Compass className="w-4 h-4 text-emerald-400" />,
  medical_emergency: <Siren className="w-4 h-4 text-red-500 animate-pulse" />
};

export const ScenarioBar: React.FC = () => {
  const { activeScenario, changeScenario } = useDrive();
  const scenarios = ScenarioSimulator.getAllScenarios();

  return (
    <div className="bg-[#0A0E17]/90 border-b border-cyan-500/20 px-4 py-2 flex items-center gap-3 overflow-x-auto no-scrollbar">
      <span className="text-xs uppercase tracking-wider font-semibold text-cyan-400/80 whitespace-nowrap flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
        Scenario Simulator:
      </span>
      
      <div className="flex items-center gap-2">
        {scenarios.map(sc => {
          const isActive = activeScenario.id === sc.id;
          return (
            <button
              key={sc.id}
              onClick={() => changeScenario(sc.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 border whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                  : 'bg-slate-900/60 border-slate-700/50 text-slate-400 hover:border-slate-500 hover:text-slate-200'
              }`}
            >
              {SCENARIO_ICONS[sc.id]}
              <span>{sc.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
