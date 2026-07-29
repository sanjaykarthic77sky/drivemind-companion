import { WeatherInfo } from '../types/infotainment';

export class WeatherService {
  public static getWeatherForCity(cityName: string): WeatherInfo {
    const clean = cityName.toLowerCase();

    if (clean.includes('mumbai') || clean.includes('pune') || clean.includes('lonavala')) {
      return {
        locationName: cityName,
        condition: 'Heavy Rain',
        tempC: 22,
        humidity: 92,
        windSpeedKmH: 26,
        visibilityKm: 2.0,
        precipitationProb: 85,
        alertText: 'Monsoon heavy rain front active.'
      };
    }

    if (clean.includes('kashmir') || clean.includes('srinagar')) {
      return {
        locationName: cityName,
        condition: 'Fog/Mist',
        tempC: 12,
        humidity: 82,
        windSpeedKmH: 7,
        visibilityKm: 3.2,
        precipitationProb: 20
      };
    }

    if (clean.includes('delhi') || clean.includes('jaipur')) {
      return {
        locationName: cityName,
        condition: 'Clear',
        tempC: 34,
        humidity: 42,
        windSpeedKmH: 14,
        visibilityKm: 10.0,
        precipitationProb: 0
      };
    }

    // Default pleasant weather across South & Central India
    return {
      locationName: cityName,
      condition: 'Partly Cloudy',
      tempC: 27,
      humidity: 60,
      windSpeedKmH: 12,
      visibilityKm: 9.0,
      precipitationProb: 15
    };
  }
}
