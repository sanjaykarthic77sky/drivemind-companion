import { NearbyPOI } from '../types/infotainment';

export class EmergencyService {
  public static getNearbyHospitals(lat: number, lng: number): NearbyPOI[] {
    return [
      {
        id: 'hosp-1',
        name: 'Apollo 24/7 Multispeciality Trauma Center',
        category: 'Hospital',
        distanceKm: 1.8,
        etaMinutes: 4,
        address: 'Sector 14, Main Bypass Highway Road',
        phone: '+91 1800-425-0011',
        rating: 4.8,
        isOpen24x7: true,
        lat: lat + 0.012,
        lng: lng + 0.015
      },
      {
        id: 'hosp-2',
        name: 'Fortis Emergency & Heart Care Hospital',
        category: 'Hospital',
        distanceKm: 3.4,
        etaMinutes: 7,
        address: 'NH Service Lane, Junction 4',
        phone: '+91 1800-102-4488',
        rating: 4.7,
        isOpen24x7: true,
        lat: lat - 0.018,
        lng: lng + 0.022
      },
      {
        id: 'hosp-3',
        name: 'Government District General Hospital (ICU)',
        category: 'Hospital',
        distanceKm: 5.1,
        etaMinutes: 10,
        address: 'Station Road, Medical Enclave',
        phone: '108',
        rating: 4.3,
        isOpen24x7: true,
        lat: lat + 0.035,
        lng: lng - 0.012
      }
    ];
  }

  public static getNearbyPoliceStations(lat: number, lng: number): NearbyPOI[] {
    return [
      {
        id: 'police-1',
        name: 'National Highway Traffic Patrol Station',
        category: 'Police Station',
        distanceKm: 2.2,
        etaMinutes: 5,
        address: 'Toll Plaza Control Outpost, NH-44',
        phone: '1033',
        rating: 4.5,
        isOpen24x7: true,
        lat: lat + 0.015,
        lng: lng - 0.010
      },
      {
        id: 'police-2',
        name: 'City Central Police Headquarters',
        category: 'Police Station',
        distanceKm: 4.0,
        etaMinutes: 8,
        address: 'Civil Lines, Main Square',
        phone: '112',
        rating: 4.4,
        isOpen24x7: true,
        lat: lat - 0.025,
        lng: lng - 0.018
      }
    ];
  }

  public static generateShareableGPSLink(lat: number, lng: number, locationName: string): string {
    const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`;
    return `EMERGENCY ALERT: I need immediate assistance! Current GPS Position near ${locationName}: (${lat.toFixed(4)}, ${lng.toFixed(4)}). Map: ${mapsUrl}`;
  }
}
