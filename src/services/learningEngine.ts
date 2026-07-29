import { UserPreferenceProfile } from '../types/infotainment';

export class LearningEngine {
  public static isFutureEnhancement = true;

  public static getInitialProfile(): UserPreferenceProfile {
    return {
      id: 'profile-demo-user',
      userName: 'Driver (Smart India Hackathon)',
      frequentDestinations: [
        {
          label: 'Home',
          location: { name: 'Chennai Central', address: 'Chennai, Tamil Nadu', lat: 13.0827, lng: 80.2707 }
        },
        {
          label: 'Office / Tech Park',
          location: { name: 'Bengaluru Tech Park', address: 'Bengaluru, Karnataka', lat: 12.9716, lng: 77.5946 }
        },
        {
          label: 'Weekend Retreat',
          location: { name: 'Jaipur Pink City', address: 'Jaipur, Rajasthan', lat: 26.9124, lng: 75.7873 }
        }
      ],
      preferredRouteStyle: 'Fastest',
      audioAlertsEnabled: true,
      fatigueWarningThresholdHours: 2.0,
      totalTripsCompleted: 42,
      totalDistanceKm: 3480
    };
  }

  public static getFutureLearningCapabilities(): { feature: string; description: string; status: string }[] {
    return [
      {
        feature: 'Automated Route Preference Adaptation',
        description: 'Learns whether the driver prefers toll-free highways, scenic routes, or fastest expressways based on past trip choices.',
        status: 'Planned for v2.0 (Post-SIH)'
      },
      {
        feature: 'Personalized Fatigue Sensitivity',
        description: 'Monitors driver responsiveness to rest stop alerts and dynamically adjusts break reminders from 90 to 150 minutes.',
        status: 'Planned for v2.0 (Post-SIH)'
      },
      {
        feature: 'Predictive Destination Suggestions',
        description: 'Auto-suggests "Office" during weekday morning hours (8-9 AM) and "Home" during evening hours (5-7 PM).',
        status: 'Planned for v2.0 (Post-SIH)'
      },
      {
        feature: 'Driver Voice Profile Tuning',
        description: 'Adapts voice assistant speech speed and alert brevity based on driver feedback.',
        status: 'Planned for v2.0 (Post-SIH)'
      }
    ];
  }
}
