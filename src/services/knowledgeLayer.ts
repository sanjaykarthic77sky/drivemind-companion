import { KnowledgeArticle } from '../types/infotainment';

export const KNOWLEDGE_BASE: KnowledgeArticle[] = [
  {
    id: 'safety-fatigue',
    category: 'ROAD_SAFETY',
    title: 'Highway Fatigue & Rest Stop Guidelines',
    summary: 'Continuous driving for over 2 hours significantly slows reaction time and increases accident risk by 40%.',
    rules: [
      'Take a minimum 15-minute break every 120 minutes of continuous driving.',
      'Stay hydrated and avoid heavy meals before long stretches.',
      'If drowsiness strikes, pull over at a well-lit highway dhaba or toll plaza plaza immediately.'
    ]
  },
  {
    id: 'safety-monsoon',
    category: 'ROAD_SAFETY',
    title: 'Monsoon & Heavy Rain Driving Precautions',
    summary: 'Waterlogging and aquaplaning reduce tire traction sharply on Indian highways.',
    rules: [
      'Maintain a minimum 4-second distance behind leading vehicles in heavy rain.',
      'Turn on low-beam headlights and hazard indicators if visibility drops below 50 meters.',
      'Avoid sudden braking; brake gently and gradually to avoid hydroplaning.'
    ]
  },
  {
    id: 'safety-night',
    category: 'ROAD_SAFETY',
    title: 'Night Highway Driving & High Beam Etiquette',
    summary: 'Glare from oncoming vehicles on unlit national highways is a primary cause of night collisions.',
    rules: [
      'Switch to low-beam headlights when within 150 meters of oncoming traffic.',
      'Clean windshields thoroughly to prevent starburst refraction from headlight glare.',
      'Keep speed 15-20 km/h below daytime limits to account for reduced hazard perception.'
    ]
  },
  {
    id: 'emergency-sos',
    category: 'EMERGENCY_RULES',
    title: 'Indian National Emergency Response Protocol (112)',
    summary: 'Standard operating procedure during accidents, breakdown, or medical distress on Indian roads.',
    rules: [
      'Dial 112 for unified Emergency Response (Police, Fire, Ambulance).',
      'National Highway Patrol Helpline: 1033 (NHAI Emergency Support).',
      'Turn on hazard warning flasher lights and place reflective triangle 50m behind vehicle.',
      'Share precise GPS coordinates via WhatsApp or SMS to emergency dispatch.'
    ]
  },
  {
    id: 'traffic-rules-speed',
    category: 'TRAFFIC_LAWS',
    title: 'Motor Vehicles Act Speed & Expressways Policy',
    summary: 'Speed limits across Indian Expressways (e.g. Yamuna Expressway, Bengaluru-Mysuru Expressway, Samruddhi Mahamarg).',
    rules: [
      'Access-Controlled Expressways max speed: 120 km/h for passenger cars.',
      'National Highways max speed: 100 km/h; Urban roads: 50-70 km/h.',
      'Overtake strictly from the right lane after signalling.'
    ]
  },
  {
    id: 'services-ev-fuel',
    category: 'SERVICES',
    title: 'Indian Fuel & EV Fast Charging Infrastructure',
    summary: 'Major networks operating 24/7 along state and national highways.',
    rules: [
      'EV Chargers: Tata Power EZ Charge, Zeon Charging, Jio-bp pulse (CCS2 Fast Chargers 50kW-150kW).',
      'Fuel Stations: IOCL (IndianOil), BPCL (Bharat Petroleum), HPCL (Hindustan Petroleum), Shell.',
      'Highway Rest Stops: Official NHAI Wayside Amenities (Food, Washrooms, Fuel, First Aid).'
    ]
  }
];

export class KnowledgeLayer {
  public static getArticleById(id: string): KnowledgeArticle | undefined {
    return KNOWLEDGE_BASE.find(article => article.id === id);
  }

  public static searchKnowledge(query: string): KnowledgeArticle[] {
    const q = query.toLowerCase();
    return KNOWLEDGE_BASE.filter(
      a => a.title.toLowerCase().includes(q) || 
           a.summary.toLowerCase().includes(q) || 
           a.rules.some(r => r.toLowerCase().includes(q))
    );
  }

  public static getKnowledgeForScenario(scenarioId: string): KnowledgeArticle[] {
    switch (scenarioId) {
      case 'heavy_rain':
        return [this.getArticleById('safety-monsoon')!, this.getArticleById('emergency-sos')!];
      case 'night_driving':
        return [this.getArticleById('safety-night')!, this.getArticleById('services-ev-fuel')!];
      case 'highway_trip':
        return [this.getArticleById('safety-fatigue')!, this.getArticleById('traffic-rules-speed')!];
      case 'medical_emergency':
        return [this.getArticleById('emergency-sos')!];
      default:
        return [this.getArticleById('safety-fatigue')!, this.getArticleById('traffic-rules-speed')!];
    }
  }
}
