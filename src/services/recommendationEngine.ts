import { ContextEvent, DecisionOutcome, DrivingScenario, Recommendation, RouteInfo } from '../types/infotainment';
import { KnowledgeLayer } from './knowledgeLayer';

export class RecommendationEngine {
  public static generateRecommendations(
    events: ContextEvent[],
    decisions: DecisionOutcome[],
    scenario: DrivingScenario,
    route: RouteInfo | null
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    for (const event of events) {
      const decision = decisions.find(d => d.eventId === event.id);
      if (decision?.priority === 'SILENT') continue;

      const destName = route?.destination.name || 'destination';

      switch (event.type) {
        case 'MEDICAL_SOS_TRIGGERED': {
          const knowledge = KnowledgeLayer.getArticleById('emergency-sos');
          recommendations.push({
            id: `rec-sos-${Date.now()}`,
            category: 'HOSPITAL',
            title: 'Emergency Medical & Police SOS Active',
            description: `Locating trauma hospitals & police stations near ${route?.source.name || 'Current Position'}. Ready to dispatch GPS coordinates via SMS/WhatsApp.`,
            actionLabel: 'Open SOS Emergency Hub',
            urgency: 'CRITICAL',
            knowledgeCitation: knowledge?.title,
            location: {
              name: 'Apollo Trauma Care & Emergency Hospital',
              address: 'Highway KM 142, Main Road',
              lat: 12.98,
              lng: 77.62
            }
          });
          break;
        }

        case 'FATIGUE_THRESHOLD': {
          const knowledge = KnowledgeLayer.getArticleById('safety-fatigue');
          recommendations.push({
            id: `rec-fatigue-${Date.now()}`,
            category: 'REST_STOP',
            title: 'Driving Fatigue Break Recommended',
            description: 'You have driven continuously for over 2 hours. A popular Highway Rest Plaza & Dhaba with EV Chargers is 3.2 km ahead.',
            actionLabel: 'Navigate to Rest Plaza (3.2 km)',
            impactText: 'Rest 15 mins for safety',
            urgency: 'HIGH',
            knowledgeCitation: knowledge?.summary,
            location: {
              name: 'NHAI Wayside Food Plaza & Fuel Station',
              address: 'NH Highway KM 188',
              lat: 12.92,
              lng: 77.65
            }
          });
          break;
        }

        case 'BETTER_ROUTE_AVAILABLE':
        case 'TRAFFIC_CONGESTION': {
          recommendations.push({
            id: `rec-reroute-${Date.now()}`,
            category: 'REROUTE',
            title: 'Dynamic Reroute: Bypass Congestion',
            description: `Heavy congestion detected ahead on the main highway. Switch to Expressway Bypass to save 14 minutes to ${destName}.`,
            actionLabel: 'Accept Expressway Reroute',
            impactText: 'Saves 14 mins',
            urgency: 'HIGH'
          });
          break;
        }

        case 'WEATHER_FRONT_AHEAD': {
          const knowledge = KnowledgeLayer.getArticleById('safety-monsoon');
          recommendations.push({
            id: `rec-weather-${Date.now()}`,
            category: 'SAFETY',
            title: `Adverse Weather Warning: ${scenario.weather.condition}`,
            description: `Heavy rain front detected along your route. Maintain 50m trailing distance and engage low-beam headlights.`,
            actionLabel: 'View Monsoon Safety Guide',
            impactText: 'Reduce speed to 60 km/h',
            urgency: 'MEDIUM',
            knowledgeCitation: knowledge?.rules[0]
          });
          break;
        }

        case 'NIGHT_VISIBILITY_HAZARD': {
          const knowledge = KnowledgeLayer.getArticleById('safety-night');
          recommendations.push({
            id: `rec-night-${Date.now()}`,
            category: 'SAFETY',
            title: 'Night Highway Safety Protocol',
            description: 'Late night driving detected. Low-beam headlight compliance active. Next 24x7 fuel station is 12 km ahead.',
            actionLabel: 'Locate 24x7 Fuel Station',
            urgency: 'LOW',
            knowledgeCitation: knowledge?.title
          });
          break;
        }
      }
    }

    // Always include a default POI recommendation if list is small
    if (recommendations.length < 2) {
      const fuelKnowledge = KnowledgeLayer.getArticleById('services-ev-fuel');
      recommendations.push({
        id: `rec-fuel-${Date.now()}`,
        category: 'FUEL_EV',
        title: 'Fuel & EV Fast Charger 3.5 km Ahead',
        description: 'Tata Power 60kW CCS2 Fast Charger & IOCL Fuel Station available on the left service lane.',
        actionLabel: 'Add Stop to Route',
        impactText: '3.5 km ahead',
        urgency: 'LOW',
        knowledgeCitation: fuelKnowledge?.title
      });
    }

    return recommendations;
  }
}
