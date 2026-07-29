import { ContextEvent, DecisionOutcome, DecisionPriority } from '../types/infotainment';

export class DecisionEngine {
  public static evaluateDecisions(events: ContextEvent[]): DecisionOutcome[] {
    const outcomes: DecisionOutcome[] = [];
    const hasEmergency = events.some(e => e.type === 'MEDICAL_SOS_TRIGGERED');

    for (const event of events) {
      let priority: DecisionPriority = 'MEDIUM';
      let notifyAudio = true;
      let notifyVisual = true;
      let suppressReason: string | undefined = undefined;
      let recommendedActionText = '';

      switch (event.type) {
        case 'MEDICAL_SOS_TRIGGERED':
          priority = 'CRITICAL';
          notifyAudio = true;
          notifyVisual = true;
          recommendedActionText = 'Display SOS overlay & locate nearest emergency facilities immediately.';
          break;

        case 'FATIGUE_THRESHOLD':
          priority = hasEmergency ? 'SILENT' : 'HIGH';
          notifyAudio = !hasEmergency;
          notifyVisual = true;
          if (hasEmergency) suppressReason = 'Suppressed during Medical Emergency SOS';
          recommendedActionText = 'Recommend taking a 15-minute break at the upcoming highway rest stop in 3 km.';
          break;

        case 'WEATHER_FRONT_AHEAD':
          priority = event.severity === 'critical' ? 'HIGH' : 'MEDIUM';
          notifyAudio = priority === 'HIGH';
          notifyVisual = true;
          recommendedActionText = 'Suggest lowering speed to 60 km/h and switching headlights to low-beam.';
          break;

        case 'TRAFFIC_CONGESTION':
          priority = 'MEDIUM';
          notifyAudio = false; // Prevent chime overload
          notifyVisual = true;
          recommendedActionText = 'Show dynamic bypass route suggestion card on screen.';
          break;

        case 'BETTER_ROUTE_AVAILABLE':
          priority = 'MEDIUM';
          notifyAudio = false;
          notifyVisual = true;
          recommendedActionText = 'Present single-tap "Accept Reroute (Saves 14 mins)" prompt.';
          break;

        case 'NIGHT_VISIBILITY_HAZARD':
          priority = 'LOW';
          notifyAudio = false;
          notifyVisual = true;
          recommendedActionText = 'Display subtle night driving reminder badge.';
          break;

        default:
          priority = 'LOW';
          notifyAudio = false;
          notifyVisual = true;
          recommendedActionText = 'Log event for journey summary.';
      }

      outcomes.push({
        eventId: event.id,
        priority,
        notifyAudio,
        notifyVisual,
        suppressReason,
        recommendedActionText
      });
    }

    return outcomes;
  }
}
