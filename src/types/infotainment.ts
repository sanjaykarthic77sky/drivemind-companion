export interface LocationPoint {
  name: string;
  address: string;
  lat: number;
  lng: number;
  city?: string;
  state?: string;
}

export interface RouteStep {
  instruction: string;
  distance: string;
  duration: string;
  maneuver?: string;
  maneuverType?: string;
  location?: { lat: number; lng: number };
}

export interface RouteInfo {
  id?: string;
  title: string;
  source: LocationPoint;
  destination: LocationPoint;
  distanceKm: number;
  durationMinutes: number;
  polylinePoints: { lat: number; lng: number }[];
  steps: RouteStep[];
  trafficCondition: string;
  weatherSource?: WeatherInfo;
  weatherDestination?: WeatherInfo;
  savingsMinutes?: number;
  isAlternative?: boolean;
}

export interface WeatherInfo {
  locationName: string;
  condition: 'Clear' | 'Partly Cloudy' | 'Heavy Rain' | 'Thunderstorm' | 'Fog/Mist' | 'Heatwave';
  tempC: number;
  humidity: number;
  windSpeedKmH: number;
  visibilityKm: number;
  precipitationProb: number;
  alertText?: string;
}

export type ScenarioType = 
  | 'office_commute' 
  | 'heavy_traffic' 
  | 'night_driving' 
  | 'heavy_rain' 
  | 'highway_trip' 
  | 'medical_emergency';

export interface DrivingScenario {
  id: ScenarioType;
  title: string;
  subtitle: string;
  iconName: string;
  defaultSource: LocationPoint;
  defaultDestination: LocationPoint;
  trafficLevel: string;
  weather: WeatherInfo;
  timeOfDay: 'Morning Peak' | 'Afternoon' | 'Evening Rush' | 'Late Night';
  continuousDriveHours: number;
  isEmergency: boolean;
  description: string;
}

export type ContextEventType = 
  | 'FATIGUE_THRESHOLD' 
  | 'WEATHER_FRONT_AHEAD' 
  | 'TRAFFIC_CONGESTION' 
  | 'BETTER_ROUTE_AVAILABLE' 
  | 'FUEL_EV_LOW' 
  | 'MEDICAL_SOS_TRIGGERED' 
  | 'NIGHT_VISIBILITY_HAZARD' 
  | 'SPEED_LIMIT_EXCEEDED';

export interface ContextEvent {
  id: string;
  type: ContextEventType;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  details: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export type DecisionPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SILENT';

export interface DecisionOutcome {
  eventId: string;
  priority: DecisionPriority;
  notifyAudio: boolean;
  notifyVisual: boolean;
  suppressReason?: string;
  recommendedActionText: string;
}

export type RecommendationCategory = 
  | 'REROUTE' 
  | 'REST_STOP' 
  | 'FUEL_EV' 
  | 'HOSPITAL' 
  | 'POLICE' 
  | 'SAFETY' 
  | 'WEATHER';

export interface Recommendation {
  id: string;
  category: RecommendationCategory;
  title: string;
  description: string;
  actionLabel: string;
  impactText?: string; // e.g., "Saves 14 mins"
  urgency: DecisionPriority;
  location?: LocationPoint;
  knowledgeCitation?: string;
  applied?: boolean;
}

export interface KnowledgeArticle {
  id: string;
  category: 'ROAD_SAFETY' | 'EMERGENCY_RULES' | 'TRAFFIC_LAWS' | 'SERVICES';
  title: string;
  summary: string;
  rules: string[];
}

export interface NearbyPOI {
  id: string;
  name: string;
  category: 'Hospital' | 'Police Station' | 'Fuel Station' | 'EV Charger' | 'Rest Stop / Dhaba' | 'Restaurant';
  distanceKm: number;
  etaMinutes: number;
  address: string;
  phone?: string;
  rating: number;
  isOpen24x7: boolean;
  lat: number;
  lng: number;
}

export interface UserPreferenceProfile {
  id: string;
  userName: string;
  frequentDestinations: { label: string; location: LocationPoint }[];
  preferredRouteStyle: 'Fastest' | 'Toll Free' | 'Highway Preferred';
  audioAlertsEnabled: boolean;
  fatigueWarningThresholdHours: number;
  totalTripsCompleted: number;
  totalDistanceKm: number;
}
