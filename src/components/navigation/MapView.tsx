import React, { useEffect, useRef, useState } from 'react';
import { useDrive } from '../../context/DriveContext';
import { Navigation2, Layers, ZoomIn, ZoomOut, AlertTriangle, ShieldCheck, Loader2, Maximize2, Minimize2 } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export const MapView: React.FC = () => {
  const { currentRoute, activeScenario, isLoading } = useDrive();
  const outerContainerRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const startMarkerRef = useRef<L.Marker | null>(null);
  const endMarkerRef = useRef<L.Marker | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize Leaflet map once
  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [20.5937, 78.9629], // Center of India
      zoom: 5,
      zoomControl: false,
      attributionControl: true,
    });

    // Standard OpenStreetMap tiles with custom CSS filters for dark mode (no API key required)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      className: 'map-tiles-dark',
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    mapRef.current = map;
    setMapReady(true);

    return () => {
      map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, []);

  // Handle native browser fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNativeFs = !!document.fullscreenElement;
      setIsFullscreen(isNativeFs);
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      }, 200);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // React to currentRoute changes: draw polyline + markers, fit bounds
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    const map = mapRef.current;

    // Remove previous polyline and markers
    if (polylineRef.current) { polylineRef.current.remove(); polylineRef.current = null; }
    if (startMarkerRef.current) { startMarkerRef.current.remove(); startMarkerRef.current = null; }
    if (endMarkerRef.current) { endMarkerRef.current.remove(); endMarkerRef.current = null; }

    if (!currentRoute || currentRoute.polylinePoints.length < 2) {
      // No route yet — show India overview
      map.setView([20.5937, 78.9629], 5);
      return;
    }

    const latlngs: [number, number][] = currentRoute.polylinePoints.map(p => [p.lat, p.lng]);

    // Draw the real road route polyline
    const routeColor = activeScenario.trafficLevel === 'Heavy Congestion' ? '#FF2A6D'
      : activeScenario.trafficLevel === 'Severe Standstill' ? '#FF0000'
      : '#00F0FF';

    polylineRef.current = L.polyline(latlngs, {
      color: routeColor,
      weight: 6,
      opacity: 0.95,
    }).addTo(map);

    // Custom start marker (green dot)
    const startIcon = L.divIcon({
      className: '',
      html: `<div style="
        width:18px;height:18px;
        background:#00FF9D;
        border:3px solid #fff;
        border-radius:50%;
        box-shadow:0 0 16px #00FF9D,0 0 6px #000;
      "></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });

    // Custom destination marker (cyan pulsing dot)
    const endIcon = L.divIcon({
      className: '',
      html: `<div style="
        width:22px;height:22px;
        background:#00F0FF;
        border:3px solid #fff;
        border-radius:50%;
        box-shadow:0 0 20px #00F0FF,0 0 8px #000;
      "></div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });

    startMarkerRef.current = L.marker(
      [currentRoute.source.lat, currentRoute.source.lng],
      { icon: startIcon }
    ).bindTooltip(`<b>📍 ${currentRoute.source.name}</b>`, { permanent: false, direction: 'top' })
     .addTo(map);

    endMarkerRef.current = L.marker(
      [currentRoute.destination.lat, currentRoute.destination.lng],
      { icon: endIcon }
    ).bindTooltip(`<b>🏁 ${currentRoute.destination.name}</b>`, { permanent: false, direction: 'top' })
     .addTo(map);

    // Fit map to entire route with padding
    const bounds = L.latLngBounds(latlngs);
    map.fitBounds(bounds, { padding: [50, 50], animate: true, duration: 1.2 });

  }, [currentRoute, mapReady, activeScenario.trafficLevel]);

  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();

  const toggleFullscreen = () => {
    if (!outerContainerRef.current) return;

    if (!isFullscreen) {
      if (outerContainerRef.current.requestFullscreen) {
        outerContainerRef.current.requestFullscreen().catch(() => {
          setIsFullscreen(true);
        });
      } else {
        setIsFullscreen(true);
      }
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {
          setIsFullscreen(false);
        });
      } else {
        setIsFullscreen(false);
      }
    }

    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 200);
  };

  const sourcePos = currentRoute?.source || activeScenario.defaultSource;
  const destPos = currentRoute?.destination || activeScenario.defaultDestination;

  return (
    <div
      ref={outerContainerRef}
      className={`relative w-full h-full bg-[#070A12] overflow-hidden transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-50 rounded-none w-screen h-screen border-0'
          : 'rounded-2xl border border-cyan-500/20 shadow-2xl'
      }`}
    >
      {/* Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full absolute inset-0 z-0" />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl">
          <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mb-3" />
          <p className="text-cyan-300 text-sm font-bold">Calculating real road route…</p>
          <p className="text-slate-400 text-xs mt-1 font-mono">Context Intelligence Engine active</p>
        </div>
      )}

      {/* Map HUD – Top Left: Route title + traffic status */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 flex-wrap">
        <div className="glass-panel px-3 py-2 rounded-xl flex items-center gap-2 border border-cyan-500/30">
          <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-xs font-semibold text-cyan-200 max-w-[260px] truncate">
            {currentRoute ? currentRoute.title : 'Select source and destination above'}
          </span>
        </div>

        <div className={`glass-panel px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 border ${
          activeScenario.trafficLevel === 'Heavy Congestion' || activeScenario.trafficLevel === 'Severe Standstill'
            ? 'border-red-500/40 text-red-400 bg-red-950/40'
            : activeScenario.trafficLevel === 'Moderate'
            ? 'border-amber-500/40 text-amber-300 bg-amber-950/40'
            : 'border-emerald-500/40 text-emerald-300 bg-emerald-950/40'
        }`}>
          {activeScenario.trafficLevel === 'Heavy Congestion' || activeScenario.trafficLevel === 'Severe Standstill'
            ? <AlertTriangle className="w-3.5 h-3.5" />
            : <ShieldCheck className="w-3.5 h-3.5" />}
          <span>Traffic: {activeScenario.trafficLevel}</span>
        </div>
      </div>


      {/* Map HUD – Bottom Left: Route endpoints pill */}
      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 glass-panel px-4 py-2 rounded-xl text-xs font-mono border border-slate-700 max-w-[70%]">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#00FF9D] shrink-0" />
        <span className="text-slate-300 font-semibold truncate">{sourcePos.name}</span>
        <span className="text-slate-500 shrink-0">→</span>
        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00F0FF] shrink-0" />
        <span className="text-cyan-300 font-semibold truncate">{destPos.name}</span>
      </div>

      {/* Map HUD – Top Right / Bottom Right: Map Controls (Full Screen, Zoom) */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit Full Screen' : 'Full Screen Map'}
          className={`glass-panel w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
            isFullscreen
              ? 'bg-cyan-500/30 text-cyan-200 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
              : 'text-cyan-300 hover:bg-cyan-500/20 border-cyan-500/30'
          }`}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Map HUD – Bottom Right: Zoom Controls */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
        <button onClick={handleZoomIn}
          title="Zoom In"
          className="glass-panel w-9 h-9 rounded-xl flex items-center justify-center text-cyan-300 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all">
          <ZoomIn className="w-4 h-4" />
        </button>
        <button onClick={handleZoomOut}
          title="Zoom Out"
          className="glass-panel w-9 h-9 rounded-xl flex items-center justify-center text-cyan-300 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all">
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
