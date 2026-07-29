import { ContextEvent, DrivingScenario, RouteInfo, WeatherInfo } from '../types/infotainment';

export class ContextEngine {
  public static evaluateContext(
    route: RouteInfo | null,
    weather: WeatherInfo | null,
    scenario: DrivingScenario,
    driveDurationHours: number
  ): ContextEvent[] {
    const events: ContextEvent[] = [];
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. SOS Emergency Event
    if (scenario.isEmergency) {
      events.push({
        id: `evt-sos-${Date.now()}`,
        type: 'MEDICAL_SOS_TRIGGERED',
        severity: 'critical',
        title: 'Emergency Medical / Police SOS Triggered',
        details: `Active emergency requested at current GPS location near ${route?.source.name || 'Current Position'}. Locating nearest trauma center & police station.`,
        timestamp: nowStr
      });
    }

    // 2. Driver Fatigue Detection (>2 hours continuous driving)
    if (driveDurationHours >= 2.0 || scenario.continuousDriveHours >= 2.0) {
      events.push({
        id: `evt-fatigue-${Date.now()}`,
        type: 'FATIGUE_THRESHOLD',
        severity: 'warning',
        title: 'Driver Fatigue Limit Reached',
        details: `You have been driving continuously for ${driveDurationHours.toFixed(1)} hours. Reaction time degrades by 35%. Take a short break at a nearby highway dhaba or rest stop.`,
        timestamp: nowStr,
        metadata: { duration: driveDurationHours }
      });
    }

    // 3. Heavy Rain & Weather Front Hazard
    const currentCondition = weather?.condition || scenario.weather.condition;
    if (currentCondition === 'Heavy Rain' || currentCondition === 'Thunderstorm' || currentCondition === 'Fog/Mist') {
      events.push({
        id: `evt-weather-${Date.now()}`,
        type: 'WEATHER_FRONT_AHEAD',
        severity: currentCondition === 'Thunderstorm' ? 'critical' : 'warning',
        title: `Adverse Weather Alert: ${currentCondition}`,
        details: `Heavy precipitation detected along the route to ${route?.destination.name || 'destination'}. Reduced visibility (${weather?.visibilityKm || 1.5} km). Hydroplaning risk high.`,
        timestamp: nowStr,
        metadata: { condition: currentCondition }
      });
    }

    // 4. Traffic Congestion & Delay Detection
    const traffic = scenario.trafficLevel;
    if (traffic === 'Heavy Congestion' || traffic === 'Severe Standstill') {
      events.push({
        id: `evt-traffic-${Date.now()}`,
        type: 'TRAFFIC_CONGESTION',
        severity: 'warning',
        title: `Heavy Traffic Congestion Ahead`,
        details: `Standstill traffic detected on main highway corridor. Estimated delay: +18 minutes. Alternate bypass route available.`,
        timestamp: nowStr
      });
    }

    // 5. Alternate Bypass Savings Event
    if (scenario.id === 'heavy_traffic' || scenario.id === 'office_commute') {
      events.push({
        id: `evt-reroute-${Date.now()}`,
        type: 'BETTER_ROUTE_AVAILABLE',
        severity: 'info',
        title: 'Faster Bypass Route Discovered',
        details: 'Route optimization algorithm found an expressway bypass that saves 14 minutes and avoids city congestion.',
        timestamp: nowStr,
        metadata: { savingsMinutes: 14 }
      });
    }

    // 6. Night Driving Hazards
    if (scenario.timeOfDay === 'Late Night' || scenario.id === 'night_driving') {
      events.push({
        id: `evt-night-${Date.now()}`,
        type: 'NIGHT_VISIBILITY_HAZARD',
        severity: 'info',
        title: 'Night Highway Visibility Alert',
        details: 'Driving during late hours. Ensure low-beam headlight compliance when approaching oncoming highway traffic.',
        timestamp: nowStr
      });
    }

    return events;
  }
}
