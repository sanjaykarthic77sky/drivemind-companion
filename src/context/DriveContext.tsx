import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import {
  ContextEvent,
  DecisionOutcome,
  DrivingScenario,
  Recommendation,
  RouteInfo,
  ScenarioType,
  UserPreferenceProfile,
  WeatherInfo,
  SongItem
} from '../types/infotainment';
import { MapsService } from '../services/mapsService';
import { ScenarioSimulator } from '../services/scenarioSimulator';
import { ContextEngine } from '../services/contextEngine';
import { DecisionEngine } from '../services/decisionEngine';
import { RecommendationEngine } from '../services/recommendationEngine';
import { SpeechService } from '../services/speechService';
import { LearningEngine } from '../services/learningEngine';

const DEFAULT_PLAYLIST: SongItem[] = [
  {
    id: 'demo-1',
    title: 'Neon Highway Cruise',
    artist: 'DriveMind Chill Beats',
    duration: 184,
    url: 'https://actions.google.com/sounds/v1/ambiences/car_driving_interior.ogg',
    isLocal: false
  },
  {
    id: 'demo-2',
    title: 'Midnight Synthwave Journey',
    artist: 'Cockpit Radio',
    duration: 215,
    url: 'https://actions.google.com/sounds/v1/ambiences/rain_heavy_loud.ogg',
    isLocal: false
  },
  {
    id: 'demo-3',
    title: 'Sunset Coastline Groove',
    artist: 'AI Companion Vibes',
    duration: 198,
    url: 'https://actions.google.com/sounds/v1/ambiences/wind_synth.ogg',
    isLocal: false
  }
];

interface DriveContextType {
  activeScenario: DrivingScenario;
  currentRoute: RouteInfo | null;
  weather: WeatherInfo;
  contextEvents: ContextEvent[];
  decisions: DecisionOutcome[];
  recommendations: Recommendation[];
  driveDurationHours: number;
  simulatedSpeedKmH: number;
  isSimulatingNav: boolean;
  currentStepIndex: number;
  isSOSOpen: boolean;
  isSummaryOpen: boolean;
  isApiKeyModalOpen: boolean;
  isVoiceActive: boolean;
  isLoading: boolean;
  userProfile: UserPreferenceProfile;
  activeTab: 'nav' | 'ai' | 'sos' | 'summary' | 'music';
  setActiveTab: (tab: 'nav' | 'ai' | 'sos' | 'summary' | 'music') => void;
  
  // Actions
  changeScenario: (type: ScenarioType) => Promise<void>;
  calculateNewRoute: (source: string, destination: string) => Promise<void>;
  toggleSimulation: () => void;
  applyRecommendation: (recId: string) => void;
  dismissRecommendation: (recId: string) => void;
  triggerSOS: () => void;
  closeSOS: () => void;
  finishTrip: () => void;
  setIsApiKeyModalOpen: (open: boolean) => void;
  setIsLearningModalOpen: (open: boolean) => void;
  isLearningModalOpen: boolean;
  toggleVoiceListening: () => void;

  // Music Player State & Actions
  playlist: SongItem[];
  currentSongIndex: number;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  addLocalSongs: (files: FileList) => void;
  removeSong: (songId: string) => void;
  playSong: (index: number) => void;
  togglePlayPause: () => void;
  nextSong: () => void;
  prevSong: () => void;
  seekTo: (seconds: number) => void;
  setVolumeLevel: (vol: number) => void;
  toggleMute: () => void;
}

const DriveContext = createContext<DriveContextType | undefined>(undefined);

export const DriveProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeScenario, setActiveScenario] = useState<DrivingScenario>(ScenarioSimulator.getScenario('office_commute'));
  const [currentRoute, setCurrentRoute] = useState<RouteInfo | null>(null);
  const [weather, setWeather] = useState<WeatherInfo>(ScenarioSimulator.getScenario('office_commute').weather);
  const [contextEvents, setContextEvents] = useState<ContextEvent[]>([]);
  const [decisions, setDecisions] = useState<DecisionOutcome[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [driveDurationHours, setDriveDurationHours] = useState<number>(0.5);
  const [simulatedSpeedKmH, setSimulatedSpeedKmH] = useState<number>(75);
  const [isSimulatingNav, setIsSimulatingNav] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isSOSOpen, setIsSOSOpen] = useState<boolean>(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState<boolean>(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [isLearningModalOpen, setIsLearningModalOpen] = useState<boolean>(false);
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'nav' | 'ai' | 'sos' | 'summary' | 'music'>('nav');
  const [userProfile] = useState<UserPreferenceProfile>(LearningEngine.getInitialProfile());
  const isSosOpenRef = useRef(false);

  // Music Player State
  const [playlist, setPlaylist] = useState<SongItem[]>(DEFAULT_PLAYLIST);
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(184);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Audio element instance once
  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume;
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 180);
    };

    const handleEnded = () => {
      nextSong();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Sync audio source when current index or playlist changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playlist.length === 0) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    const validIndex = Math.min(currentSongIndex, playlist.length - 1);
    const targetSong = playlist[validIndex];
    if (targetSong) {
      if (audio.src !== targetSong.url) {
        audio.src = targetSong.url;
        audio.load();
        if (isPlaying) {
          audio.play().catch(e => console.warn('Audio playback error:', e));
        }
      }
    }
  }, [currentSongIndex, playlist]);

  // Sync volume and mute state
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Music Control Handlers
  const addLocalSongs = (files: FileList) => {
    const newSongs: SongItem[] = Array.from(files).map((file, idx) => {
      const titleWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      const parts = titleWithoutExt.split('-');
      const artist = parts.length > 1 ? parts[0].trim() : 'Local Device';
      const title = parts.length > 1 ? parts.slice(1).join('-').trim() : titleWithoutExt;

      return {
        id: `local-${Date.now()}-${idx}`,
        title: title || file.name,
        artist: artist || 'Local Device',
        duration: 210, // Estimate until metadata loads
        url: URL.createObjectURL(file),
        isLocal: true,
        file
      };
    });

    setPlaylist(prev => [...prev, ...newSongs]);

    // If no song was playing or playlist was empty, auto-play first added song
    if (playlist.length === 0) {
      setCurrentSongIndex(0);
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.src = newSongs[0].url;
        audioRef.current.play().catch(() => {});
      }
    }
  };

  const removeSong = (songId: string) => {
    setPlaylist(prev => {
      const idxToRemove = prev.findIndex(s => s.id === songId);
      if (idxToRemove === -1) return prev;

      const filtered = prev.filter(s => s.id !== songId);

      // If removed song was currently playing
      if (idxToRemove === currentSongIndex) {
        if (filtered.length > 0) {
          const newIdx = Math.min(currentSongIndex, filtered.length - 1);
          setCurrentSongIndex(newIdx);
        } else {
          setCurrentSongIndex(0);
          setIsPlaying(false);
          if (audioRef.current) audioRef.current.pause();
        }
      } else if (idxToRemove < currentSongIndex) {
        setCurrentSongIndex(prevIdx => Math.max(0, prevIdx - 1));
      }

      return filtered;
    });
  };

  const playSong = (index: number) => {
    if (index < 0 || index >= playlist.length) return;
    setCurrentSongIndex(index);
    setIsPlaying(true);
    const targetSong = playlist[index];
    if (audioRef.current && targetSong) {
      audioRef.current.src = targetSong.url;
      audioRef.current.play().catch(e => console.warn('Play error:', e));
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current || playlist.length === 0) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(e => console.warn('Play error:', e));
    }
  };

  const nextSong = () => {
    if (playlist.length === 0) return;
    const nextIdx = (currentSongIndex + 1) % playlist.length;
    playSong(nextIdx);
  };

  const prevSong = () => {
    if (playlist.length === 0) return;
    const prevIdx = (currentSongIndex - 1 + playlist.length) % playlist.length;
    playSong(prevIdx);
  };

  const seekTo = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  };

  const setVolumeLevel = (vol: number) => {
    setVolume(vol);
    if (vol > 0 && isMuted) setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  const evaluateSystem = (
    route: RouteInfo | null,
    weatherInfo: WeatherInfo,
    scenario: DrivingScenario,
    duration: number
  ) => {
    const events = ContextEngine.evaluateContext(route, weatherInfo, scenario, duration);
    const decs = DecisionEngine.evaluateDecisions(events);
    const recs = RecommendationEngine.generateRecommendations(events, decs, scenario, route);
    setContextEvents(events);
    setDecisions(decs);
    setRecommendations(recs);

    const topUrgentRec = recs.find(r => r.urgency === 'CRITICAL' || r.urgency === 'HIGH');
    if (topUrgentRec && !isSosOpenRef.current) {
      SpeechService.speak(`DriveMind Alert: ${topUrgentRec.title}.`);
    }
  };

  // Load initial route on mount
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      const scenario = ScenarioSimulator.getScenario('office_commute');
      setActiveScenario(scenario);
      setWeather(scenario.weather);
      try {
        const route = await MapsService.calculateRoute(scenario.defaultSource, scenario.defaultDestination);
        setCurrentRoute(route);
        evaluateSystem(route, scenario.weather, scenario, scenario.continuousDriveHours);
      } catch (e) {
        console.error('Init route error:', e);
      }
      setIsLoading(false);
    };
    init();
  }, []);

  // Simulation timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isSimulatingNav && currentRoute && currentRoute.steps.length > 0) {
      interval = setInterval(() => {
        setCurrentStepIndex(prev => {
          const next = prev + 1;
          if (next >= currentRoute.steps.length) {
            setIsSimulatingNav(false);
            return prev;
          }
          return next;
        });
        setSimulatedSpeedKmH(prev => Math.min(105, Math.max(45, prev + (Math.random() > 0.5 ? 3 : -3))));
        setDriveDurationHours(prev => prev + 0.05);
      }, 4000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isSimulatingNav, currentRoute]);

  const changeScenario = async (type: ScenarioType) => {
    setIsLoading(true);
    const scenario = ScenarioSimulator.getScenario(type);
    setActiveScenario(scenario);
    setWeather(scenario.weather);
    setDriveDurationHours(scenario.continuousDriveHours);
    setCurrentStepIndex(0);
    setIsSimulatingNav(false);

    if (scenario.isEmergency) {
      isSosOpenRef.current = true;
      setIsSOSOpen(true);
      setActiveTab('sos');
    }

    try {
      const route = await MapsService.calculateRoute(scenario.defaultSource, scenario.defaultDestination);
      setCurrentRoute(route);
      evaluateSystem(route, scenario.weather, scenario, scenario.continuousDriveHours);
    } catch (e) {
      console.error('Scenario route error:', e);
    }
    setIsLoading(false);
  };

  const calculateNewRoute = async (source: string, destination: string) => {
    setIsLoading(true);
    setCurrentStepIndex(0);
    setIsSimulatingNav(false);
    try {
      const route = await MapsService.calculateRoute(source, destination);
      setCurrentRoute(route);
      evaluateSystem(route, weather, activeScenario, driveDurationHours);
    } catch (e) {
      console.error('Custom route error:', e);
    }
    setIsLoading(false);
  };

  const toggleSimulation = () => {
    setIsSimulatingNav(prev => !prev);
    if (!isSimulatingNav) setCurrentStepIndex(0);
  };

  const applyRecommendation = (recId: string) => {
    setRecommendations(prev => prev.map(r => r.id === recId ? { ...r, applied: true } : r));
    const targetRec = recommendations.find(r => r.id === recId);
    if (targetRec?.category === 'REROUTE' && currentRoute) {
      setCurrentRoute(prev => prev ? {
        ...prev,
        title: `${prev.title} (Bypass Applied)`,
        durationMinutes: Math.max(10, prev.durationMinutes - 14),
        trafficCondition: 'Clear',
        savingsMinutes: 14
      } : null);
      SpeechService.speak("Route bypass accepted. Saving 14 minutes.");
    } else {
      SpeechService.speak(`Recommendation applied: ${targetRec?.title || ''}`);
    }
  };

  const dismissRecommendation = (recId: string) => {
    setRecommendations(prev => prev.filter(r => r.id !== recId));
  };

  const triggerSOS = () => {
    isSosOpenRef.current = true;
    setIsSOSOpen(true);
    setActiveTab('sos');
  };

  const closeSOS = () => {
    isSosOpenRef.current = false;
    setIsSOSOpen(false);
    setActiveTab('nav');
  };

  const finishTrip = () => {
    setIsSimulatingNav(false);
    setIsSummaryOpen(true);
    setActiveTab('summary');
    SpeechService.speak("Journey completed. DriveMind AI trip summary is ready.");
  };

  const toggleVoiceListening = () => {
    if (isVoiceActive) {
      SpeechService.stopListening();
      setIsVoiceActive(false);
    } else {
      setIsVoiceActive(true);
      SpeechService.startListening(
        (transcript) => {
          setIsVoiceActive(false);
          SpeechService.speak(`Received: "${transcript}". Processing.`);
          if (transcript.toLowerCase().includes('emergency') || transcript.toLowerCase().includes('help')) {
            triggerSOS();
          } else if (transcript.toLowerCase().includes('traffic') || transcript.toLowerCase().includes('reroute')) {
            changeScenario('heavy_traffic');
          } else if (transcript.toLowerCase().includes('rain')) {
            changeScenario('heavy_rain');
          }
        },
        () => setIsVoiceActive(false)
      );
    }
  };

  return (
    <DriveContext.Provider value={{
      activeScenario,
      currentRoute,
      weather,
      contextEvents,
      decisions,
      recommendations,
      driveDurationHours,
      simulatedSpeedKmH,
      isSimulatingNav,
      currentStepIndex,
      isSOSOpen,
      isSummaryOpen,
      isApiKeyModalOpen,
      isLearningModalOpen,
      isVoiceActive,
      isLoading,
      userProfile,
      activeTab,
      setActiveTab,
      changeScenario,
      calculateNewRoute,
      toggleSimulation,
      applyRecommendation,
      dismissRecommendation,
      triggerSOS,
      closeSOS,
      finishTrip,
      setIsApiKeyModalOpen,
      setIsLearningModalOpen,
      toggleVoiceListening,

      // Music Player
      playlist,
      currentSongIndex,
      isPlaying,
      volume,
      isMuted,
      currentTime,
      duration,
      addLocalSongs,
      removeSong,
      playSong,
      togglePlayPause,
      nextSong,
      prevSong,
      seekTo,
      setVolumeLevel,
      toggleMute
    }}>
      {children}
    </DriveContext.Provider>
  );
};

export const useDrive = () => {
  const context = useContext(DriveContext);
  if (!context) throw new Error('useDrive must be used within a DriveProvider');
  return context;
};
