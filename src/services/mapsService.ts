/**
 * MapsService.ts
 * Real geocoding (Nominatim) + Real road routing (OSRM)
 * No API key required. Works for any location in India and worldwide.
 */

import { LocationPoint, RouteInfo, RouteStep } from '../types/infotainment';

// ─────────────────────────────────────────────────────────────────────────────
//  Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Nominatim geocoding: name → {lat, lng, display_name} */
async function geocodeLocation(query: string): Promise<{ lat: number; lng: number; display_name: string } | null> {
  try {
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('q', query + ', India');
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', '1');
    url.searchParams.set('addressdetails', '1');

    const res = await fetch(url.toString(), {
      headers: { 'Accept-Language': 'en', 'User-Agent': 'DriveMindAI/1.0' },
    });

    if (!res.ok) throw new Error(`Nominatim HTTP ${res.status}`);
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      // Retry without ", India" suffix if no result
      const url2 = new URL('https://nominatim.openstreetmap.org/search');
      url2.searchParams.set('q', query);
      url2.searchParams.set('format', 'json');
      url2.searchParams.set('limit', '1');
      const res2 = await fetch(url2.toString(), {
        headers: { 'Accept-Language': 'en', 'User-Agent': 'DriveMindAI/1.0' },
      });
      const data2 = await res2.json();
      if (!Array.isArray(data2) || data2.length === 0) return null;
      return {
        lat: parseFloat(data2[0].lat),
        lng: parseFloat(data2[0].lon),
        display_name: data2[0].display_name,
      };
    }

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      display_name: data[0].display_name,
    };
  } catch (e) {
    console.error('[MapsService] Geocoding error:', e);
    return null;
  }
}

/** Nominatim autocomplete suggestions for the search bar */
export async function fetchSuggestions(query: string): Promise<LocationPoint[]> {
  if (!query || query.trim().length < 2) return [];
  try {
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('q', query.trim());
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', '6');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('countrycodes', 'in'); // limit to India

    const res = await fetch(url.toString(), {
      headers: { 'Accept-Language': 'en', 'User-Agent': 'DriveMindAI/1.0' },
    });
    const data = await res.json();

    return (data as any[]).map(item => ({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      name: item.name || item.display_name.split(',')[0],
      address: item.display_name,
    }));
  } catch (e) {
    console.error('[MapsService] Suggestions error:', e);
    return [];
  }
}

/** OSRM route between two lat/lng points – returns polyline + step-by-step directions */
async function getOsrmRoute(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): Promise<{
  polylinePoints: { lat: number; lng: number }[];
  steps: RouteStep[];
  distanceKm: number;
  durationMinutes: number;
} | null> {
  try {
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${from.lng},${from.lat};${to.lng},${to.lat}` +
      `?overview=full&geometries=geojson&steps=true&annotations=false`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`OSRM HTTP ${res.status}`);
    const data = await res.json();

    if (!data.routes || data.routes.length === 0) return null;

    const route = data.routes[0];
    const geom: number[][] = route.geometry.coordinates; // [lng, lat]

    const polylinePoints: { lat: number; lng: number }[] = geom.map(([lng, lat]) => ({ lat, lng }));

    const distanceKm = Math.round((route.distance / 1000) * 10) / 10;
    const durationMinutes = Math.round(route.duration / 60);

    // Parse turn-by-turn steps from OSRM legs
    const steps: RouteStep[] = [];
    for (const leg of route.legs || []) {
      for (const step of leg.steps || []) {
        if (step.maneuver?.type) {
          steps.push({
            instruction: buildInstruction(step.maneuver.type, step.maneuver.modifier, step.name),
            distance: `${Math.round(step.distance)}m`,
            duration: `${Math.round(step.duration / 60)} min`,
            maneuverType: step.maneuver.type,
          });
        }
      }
    }

    return { polylinePoints, steps, distanceKm, durationMinutes };
  } catch (e) {
    console.error('[MapsService] OSRM error:', e);
    return null;
  }
}

/** Build a human-readable instruction from OSRM step data */
function buildInstruction(type: string, modifier?: string, streetName?: string): string {
  const street = streetName && streetName !== '' ? ` onto ${streetName}` : '';
  switch (type) {
    case 'depart':       return `Start heading ${modifier || 'north'}${street}`;
    case 'turn':         return `Turn ${modifier || 'right'}${street}`;
    case 'continue':     return `Continue${street}`;
    case 'merge':        return `Merge ${modifier || 'right'}${street}`;
    case 'fork':         return `Take the ${modifier || 'right'} fork${street}`;
    case 'roundabout':   return `Take the roundabout${street}`;
    case 'exit roundabout': return `Exit the roundabout${street}`;
    case 'arrive':       return streetName ? `Arrive at ${streetName}` : 'You have arrived at your destination';
    default:             return `${type}${street}`;
  }
}

/** Determine traffic condition based on ratio of drive time to free-flow */
function inferTrafficCondition(actualMinutes: number, freeFlowEstimate: number): string {
  const ratio = actualMinutes / freeFlowEstimate;
  if (ratio < 1.15) return 'Clear Roads';
  if (ratio < 1.4)  return 'Light Traffic';
  if (ratio < 1.8)  return 'Moderate';
  if (ratio < 2.2)  return 'Heavy Congestion';
  return 'Severe Standstill';
}

// ─────────────────────────────────────────────────────────────────────────────
//  Public API
// ─────────────────────────────────────────────────────────────────────────────

export const MapsService = {
  /**
   * Geocode source + destination, then fetch a real road route from OSRM.
   * Returns a fully populated RouteInfo object for the map and context engine.
   */
  async calculateRoute(source: string | LocationPoint, destination: string | LocationPoint): Promise<RouteInfo | null> {
    let fromPoint: LocationPoint | null = null;
    let toPoint: LocationPoint | null = null;

    // Resolve source
    if (typeof source === 'string') {
      const g = await geocodeLocation(source);
      if (!g) {
        console.warn(`[MapsService] Could not geocode source: ${source}`);
        return null;
      }
      fromPoint = {
        lat: g.lat,
        lng: g.lng,
        name: source,
        address: g.display_name,
      };
    } else {
      fromPoint = source;
    }

    // Resolve destination
    if (typeof destination === 'string') {
      const g = await geocodeLocation(destination);
      if (!g) {
        console.warn(`[MapsService] Could not geocode destination: ${destination}`);
        return null;
      }
      toPoint = {
        lat: g.lat,
        lng: g.lng,
        name: destination,
        address: g.display_name,
      };
    } else {
      toPoint = destination;
    }

    // Fetch real road route
    const osrm = await getOsrmRoute(fromPoint, toPoint);
    if (!osrm) {
      console.warn('[MapsService] OSRM returned no route');
      return null;
    }

    // Estimate free-flow time = distance / 80 km·h → minutes (rough highway speed)
    const freeFlowMinutes = (osrm.distanceKm / 80) * 60;
    const trafficCondition = inferTrafficCondition(osrm.durationMinutes, freeFlowMinutes);

    const routeTitle = `${fromPoint.name} → ${toPoint.name}`;

    return {
      title: routeTitle,
      source: fromPoint,
      destination: toPoint,
      polylinePoints: osrm.polylinePoints,
      steps: osrm.steps,
      distanceKm: osrm.distanceKm,
      durationMinutes: osrm.durationMinutes,
      trafficCondition,
    };
  },

  /** Autocomplete suggestions (used by RouteSearchBar) */
  async fetchLocationSuggestions(query: string): Promise<LocationPoint[]> {
    return fetchSuggestions(query);
  },
};
