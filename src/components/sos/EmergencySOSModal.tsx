import React, { useState } from 'react';
import { useDrive } from '../../context/DriveContext';
import { EmergencyService } from '../../services/emergencyService';
import { KnowledgeLayer } from '../../services/knowledgeLayer';
import { Siren, PhoneCall, Share2, MapPin, X, ShieldAlert, Check } from 'lucide-react';

export const EmergencySOSModal: React.FC = () => {
  const { currentRoute, activeScenario, closeSOS } = useDrive();
  const [copiedGPS, setCopiedGPS] = useState<boolean>(false);
  const [activeCall, setActiveCall] = useState<string | null>(null);

  const loc = currentRoute?.source || activeScenario.defaultSource;
  const hospitals = EmergencyService.getNearbyHospitals(loc.lat, loc.lng);
  const policeStations = EmergencyService.getNearbyPoliceStations(loc.lat, loc.lng);
  const sosKnowledge = KnowledgeLayer.getArticleById('emergency-sos');

  const gpsText = EmergencyService.generateShareableGPSLink(loc.lat, loc.lng, loc.name);

  const handleCopyGPS = () => {
    navigator.clipboard.writeText(gpsText);
    setCopiedGPS(true);
    setTimeout(() => setCopiedGPS(false), 3000);
  };

  const handleSimulateCall = (number: string, name: string) => {
    setActiveCall(`${name} (${number})`);
    setTimeout(() => setActiveCall(null), 5000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6 animate-fadeIn">
      <div className="w-full max-w-4xl max-h-[90vh] bg-[#0F080C] border-2 border-red-500/60 rounded-3xl p-6 shadow-[0_0_60px_rgba(255,42,109,0.4)] overflow-y-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-red-500/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 border-2 border-red-500 flex items-center justify-center animate-pulse shadow-[0_0_20px_rgba(255,42,109,0.5)]">
              <Siren className="w-7 h-7 text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-red-400 tracking-wider flex items-center gap-2">
                EMERGENCY SOS MODE
              </h2>
              <p className="text-xs text-red-300/80 font-mono">
                GPS Position: {loc.name} ({loc.lat.toFixed(4)}, {loc.lng.toFixed(4)})
              </p>
            </div>
          </div>

          <button
            onClick={closeSOS}
            className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Call Simulation Banner */}
        {activeCall && (
          <div className="bg-red-500/20 border border-red-500 p-4 rounded-2xl flex items-center justify-between text-red-300 animate-pulse">
            <div className="flex items-center gap-3">
              <PhoneCall className="w-5 h-5 text-red-400" />
              <span className="text-sm font-bold">Simulating Call to: {activeCall}...</span>
            </div>
            <span className="text-xs font-mono">Dialing 112...</span>
          </div>
        )}

        {/* Quick Dial 112 & Share GPS Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* National Emergency Hotline Button */}
          <button
            onClick={() => handleSimulateCall('112', 'National Emergency Response')}
            className="p-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-extrabold text-sm flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(255,42,109,0.5)] transition-all"
          >
            <PhoneCall className="w-5 h-5" />
            <span>DIAL NATIONAL EMERGENCY (112)</span>
          </button>

          {/* Share GPS Location Button */}
          <button
            onClick={handleCopyGPS}
            className="p-4 rounded-2xl bg-slate-900 border border-red-500/50 hover:border-red-400 text-red-200 font-bold text-sm flex items-center justify-center gap-3 transition-all"
          >
            {copiedGPS ? <Check className="w-5 h-5 text-emerald-400" /> : <Share2 className="w-5 h-5 text-red-400" />}
            <span>{copiedGPS ? 'GPS Location Copied to Clipboard!' : 'Share Live GPS Coordinates'}</span>
          </button>
        </div>

        {/* Medical Facilities & Police Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Nearby Hospitals */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-red-500/30 flex flex-col gap-3">
            <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-500" />
              Nearest Trauma Hospitals
            </h3>

            <div className="space-y-2.5">
              {hospitals.map(hosp => (
                <div key={hosp.id} className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-100">{hosp.name}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{hosp.address} ({hosp.distanceKm} km • {hosp.etaMinutes} mins)</p>
                  </div>
                  <button
                    onClick={() => handleSimulateCall(hosp.phone || '108', hosp.name)}
                    className="px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 font-bold hover:bg-red-500/30 flex items-center gap-1.5 shrink-0"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Nearby Police Stations */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-red-500/30 flex flex-col gap-3">
            <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              Nearest Police & Highway Patrol
            </h3>

            <div className="space-y-2.5">
              {policeStations.map(police => (
                <div key={police.id} className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-100">{police.name}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{police.address} ({police.distanceKm} km)</p>
                  </div>
                  <button
                    onClick={() => handleSimulateCall(police.phone || '112', police.name)}
                    className="px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 font-bold hover:bg-red-500/30 flex items-center gap-1.5 shrink-0"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Emergency Rules Guidelines */}
        {sosKnowledge && (
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300">
            <h4 className="font-bold text-red-400 mb-1">{sosKnowledge.title}</h4>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400">
              {sosKnowledge.rules.map((rule, i) => (
                <li key={i}>{rule}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
