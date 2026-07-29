import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import {
  ContextEvent,
  DecisionOutcome,
  DrivingScenario,
  Recommendation,
  RouteInfo,
  ScenarioType,
  UserPreferenceProfile,
  WeatherInfo
} from '../types/infotainment';
import { MapsService } from '../services/mapsService';
import { ScenarioSimulator } from '../services/scenarioSimulator';
import { ContextEngine } from '../services/contextEngine';
import { DecisionEngine } from '../services/decisionEngine';
import { RecommendationEngine } from '../services/recommendationEngine';
import { SpeechService } from '../services/speechService';
import { LearningEngine } from '../services/learningEngine';

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
  activeTab: 'nav' | 'ai' | 'sos' | 'summary';
  setActiveTab: (tab: 'nav' | 'ai' | 'sos' | 'summary') => void;
  
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
  const [activeTab, setActiveTab] = useState<'nav' | 'ai' | 'sos' | 'summary'>('nav');
  const [userProfile] = useState<UserPreferenceProfile>(LearningEngine.getInitialProfile());
  const isSosOpenRef = useRef(false);

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
