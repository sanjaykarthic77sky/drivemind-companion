import React, { useState } from 'react';
import { useDrive } from '../../context/DriveContext';
import { MapsService } from '../../services/mapsService';
import { Key, X, Check, AlertCircle, MapPin } from 'lucide-react';

export const ApiKeySettingsModal: React.FC = () => {
  const { isApiKeyModalOpen, setIsApiKeyModalOpen } = useDrive();
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [status, setStatus] = useState<string | null>(null);

  if (!isApiKeyModalOpen) return null;

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) return;

    setStatus('Verifying Google Maps API Key...');
    const loaded = await MapsService.initGoogleMaps(apiKeyInput.trim());
    if (loaded) {
      setStatus('Success! Google Maps JavaScript API loaded.');
      setTimeout(() => setIsApiKeyModalOpen(false), 2000);
    } else {
      setStatus('Failed to load Google Maps with provided key. Please check key restrictions.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-fadeIn">
      <div className="w-full max-w-md glass-panel p-6 rounded-3xl border border-cyan-500/40 shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
          <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
            <Key className="w-4 h-4 text-cyan-400" />
            <span>Google Maps Platform API Key</span>
          </div>
          <button onClick={() => setIsApiKeyModalOpen(false)} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          DriveMind AI uses Google Maps Places, Directions, and Distance Matrix APIs.
          Leave blank to use the built-in fallback router for India routes.
        </p>

        <form onSubmit={handleSaveKey} className="flex flex-col gap-3">
          <input
            type="password"
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />

          {status && (
            <p className="text-xs font-mono text-cyan-400 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              {status}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsApiKeyModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-xs text-black rounded-xl hover:scale-105 transition-all"
            >
              Save Key
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
