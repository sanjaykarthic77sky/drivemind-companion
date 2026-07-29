import { DrivingScenario, LocationPoint, ScenarioType } from '../types/infotainment';

/** Well-known Indian cities with accurate lat/lng coordinates */
export const FAMOUS_INDIAN_CITIES: Record<string, LocationPoint> = {
  chennai:     { name: 'Chennai', address: 'Chennai, Tamil Nadu, India', lat: 13.0827, lng: 80.2707 },
  bengaluru:   { name: 'Bengaluru', address: 'Bengaluru, Karnataka, India', lat: 12.9716, lng: 77.5946 },
  mumbai:      { name: 'Mumbai', address: 'Mumbai, Maharashtra, India', lat: 19.0760, lng: 72.8777 },
  pune:        { name: 'Pune', address: 'Pune, Maharashtra, India', lat: 18.5204, lng: 73.8567 },
  delhi:       { name: 'New Delhi', address: 'New Delhi, Delhi, India', lat: 28.6139, lng: 77.2090 },
  jaipur:      { name: 'Jaipur', address: 'Jaipur, Rajasthan, India', lat: 26.9124, lng: 75.7873 },
  hyderabad:   { name: 'Hyderabad', address: 'Hyderabad, Telangana, India', lat: 17.3850, lng: 78.4867 },
  kolkata:     { name: 'Kolkata', address: 'Kolkata, West Bengal, India', lat: 22.5726, lng: 88.3639 },
  kashmir:     { name: 'Srinagar', address: 'Srinagar, Jammu & Kashmir, India', lat: 34.0837, lng: 74.7973 },
  kanyakumari: { name: 'Kanyakumari', address: 'Kanyakumari, Tamil Nadu, India', lat: 8.0883, lng: 77.5385 },
  coimbatore:  { name: 'Coimbatore', address: 'Coimbatore, Tamil Nadu, India', lat: 11.0168, lng: 76.9558 },
  madurai:     { name: 'Madurai', address: 'Madurai, Tamil Nadu, India', lat: 9.9252, lng: 78.1198 },
  kochi:       { name: 'Kochi', address: 'Kochi, Kerala, India', lat: 9.9312, lng: 76.2673 },
  bhubaneswar: { name: 'Bhubaneswar', address: 'Bhubaneswar, Odisha, India', lat: 20.2961, lng: 85.8245 },
  nagpur:      { name: 'Nagpur', address: 'Nagpur, Maharashtra, India', lat: 21.1458, lng: 79.0882 },
  lucknow:     { name: 'Lucknow', address: 'Lucknow, Uttar Pradesh, India', lat: 26.8467, lng: 80.9462 },
  ahmedabad:   { name: 'Ahmedabad', address: 'Ahmedabad, Gujarat, India', lat: 23.0225, lng: 72.5714 },
};

export const SCENARIOS: Record<ScenarioType, DrivingScenario> = {
  'office_commute': {
    id: 'office_commute',
    title: 'Office Commute',
    subtitle: 'Morning Peak Hour Commute in Tech Corridor',
    iconName: 'Briefcase',
    defaultSource: FAMOUS_INDIAN_CITIES['chennai'],
    defaultDestination: FAMOUS_INDIAN_CITIES['bengaluru'],
    trafficLevel: 'Moderate',
    weather: {
      locationName: 'Bengaluru',
      condition: 'Partly Cloudy',
      tempC: 24,
      humidity: 62,
      windSpeedKmH: 14,
      visibilityKm: 8.5,
      precipitationProb: 10
    },
    timeOfDay: 'Morning Peak',
    continuousDriveHours: 0.5,
    isEmergency: false,
    description: 'Routine morning commute with moderate urban congestion. AI suggests optimal lane choices and ETA updates.'
  },

  'heavy_traffic': {
    id: 'heavy_traffic',
    title: 'Heavy Traffic',
    subtitle: 'Severe Highway Bottleneck (Delhi → Jaipur)',
    iconName: 'AlertTriangle',
    defaultSource: FAMOUS_INDIAN_CITIES['delhi'],
    defaultDestination: FAMOUS_INDIAN_CITIES['jaipur'],
    trafficLevel: 'Heavy Congestion',
    weather: {
      locationName: 'Jaipur',
      condition: 'Clear',
      tempC: 32,
      humidity: 45,
      windSpeedKmH: 10,
      visibilityKm: 10.0,
      precipitationProb: 0
    },
    timeOfDay: 'Evening Rush',
    continuousDriveHours: 1.8,
    isEmergency: false,
    description: '18-minute delay on NH-48 due to highway toll lane bottleneck. AI Context Engine recommends expressway bypass.'
  },

  'night_driving': {
    id: 'night_driving',
    title: 'Night Driving',
    subtitle: 'Late Night Stretch (Kashmir → Kanyakumari NH44)',
    iconName: 'Moon',
    defaultSource: FAMOUS_INDIAN_CITIES['kashmir'],
    defaultDestination: FAMOUS_INDIAN_CITIES['kanyakumari'],
    trafficLevel: 'Clear',
    weather: {
      locationName: 'Srinagar',
      condition: 'Fog/Mist',
      tempC: 14,
      humidity: 80,
      windSpeedKmH: 8,
      visibilityKm: 3.5,
      precipitationProb: 15,
      alertText: 'Late night mist reduces headlight range.'
    },
    timeOfDay: 'Late Night',
    continuousDriveHours: 2.2,
    isEmergency: false,
    description: 'Unlit highway driving during late night. High-beam warning protocol and 24x7 fuel station locator engaged.'
  },

  'heavy_rain': {
    id: 'heavy_rain',
    title: 'Heavy Rain',
    subtitle: 'Monsoon Downpour (Mumbai → Pune Expressway)',
    iconName: 'CloudRain',
    defaultSource: FAMOUS_INDIAN_CITIES['mumbai'],
    defaultDestination: FAMOUS_INDIAN_CITIES['pune'],
    trafficLevel: 'Moderate',
    weather: {
      locationName: 'Mumbai',
      condition: 'Heavy Rain',
      tempC: 26,
      humidity: 96,
      windSpeedKmH: 32,
      visibilityKm: 2.8,
      precipitationProb: 92,
      alertText: 'Reduced visibility on Expressway. Slow to 60 km/h.'
    },
    timeOfDay: 'Afternoon',
    continuousDriveHours: 1.0,
    isEmergency: false,
    description: 'Heavy monsoon rain with low visibility. AI recommends slowing down, keeping headlights on, and maintaining extra following distance.'
  },

  'highway_trip': {
    id: 'highway_trip',
    title: 'Highway Trip',
    subtitle: 'Long Distance Interstate (Kolkata → Bhubaneswar)',
    iconName: 'Navigation',
    defaultSource: FAMOUS_INDIAN_CITIES['kolkata'],
    defaultDestination: FAMOUS_INDIAN_CITIES['bhubaneswar'],
    trafficLevel: 'Clear',
    weather: {
      locationName: 'Kolkata',
      condition: 'Partly Cloudy',
      tempC: 29,
      humidity: 70,
      windSpeedKmH: 15,
      visibilityKm: 9.0,
      precipitationProb: 5
    },
    timeOfDay: 'Morning Peak',
    continuousDriveHours: 2.5,
    isEmergency: false,
    description: 'Long highway stretch with rest stop reminders, fuel station lookup, and fatigue monitoring.'
  },

  'medical_emergency': {
    id: 'medical_emergency',
    title: 'Medical Emergency',
    subtitle: 'SOS Activated – Nearest Hospital Routing',
    iconName: 'Cross',
    defaultSource: FAMOUS_INDIAN_CITIES['hyderabad'],
    defaultDestination: FAMOUS_INDIAN_CITIES['kochi'],
    trafficLevel: 'Heavy Congestion',
    weather: {
      locationName: 'Hyderabad',
      condition: 'Clear',
      tempC: 30,
      humidity: 50,
      windSpeedKmH: 12,
      visibilityKm: 9.5,
      precipitationProb: 0,
      alertText: 'EMERGENCY – Routing to nearest hospital.'
    },
    timeOfDay: 'Afternoon',
    continuousDriveHours: 3.0,
    isEmergency: true,
    description: 'Medical emergency triggered. SOS mode active. Nearest hospital and emergency services being alerted.'
  },
};

export const ScenarioSimulator = {
  getScenario(type: ScenarioType): DrivingScenario {
    return SCENARIOS[type];
  },
  getAllScenarios(): DrivingScenario[] {
    return Object.values(SCENARIOS);
  },
};
