import { type Place } from '../types/place';

export type Bounds = {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
};

export function boundsFromCenter(lat: number, lng: number, radiusDeg = 0.09): Bounds {
  return {
    minLat: lat - radiusDeg,
    maxLat: lat + radiusDeg,
    minLon: lng - radiusDeg,
    maxLon: lng + radiusDeg,
  };
}

const CATEGORIES = [
  'tourism.attraction',
  'tourism.sights',
  'leisure.park',
  'national_park',
  'entertainment.museum',
  'entertainment.culture',
  'heritage',
].join(',');

export async function fetchPlacesByBounds(bounds: Bounds): Promise<Place[]> {
  const key = process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY;
  if (!key) return [];
  const { minLon, maxLat, maxLon, minLat } = bounds;
  const filter = `rect:${minLon},${maxLat},${maxLon},${minLat}`;
  const url = `https://api.geoapify.com/v2/places?categories=${CATEGORIES}&filter=${filter}&limit=20&apiKey=${key}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const json = await res.json();
  return parsePlaces(json);
}

function formatCategory(cats: string[]): string | null {
  if (!cats?.length) return null;
  const last = cats[0].split('.').pop() ?? cats[0];
  return last.charAt(0).toUpperCase() + last.slice(1).replace(/_/g, ' ');
}

function parsePlaces(geojson: { features?: unknown[] }): Place[] {
  if (!geojson?.features) return [];
  return (geojson.features as any[])
    .filter((f) => f.geometry?.coordinates && f.properties?.name)
    .map((f): Place => {
      const p = f.properties ?? {};
      const [lng, lat] = f.geometry.coordinates;
      return {
        id: p.place_id ?? `${lat}_${lng}`,
        name: p.name,
        latitude: lat,
        longitude: lng,
        category: formatCategory(p.categories ?? []),
        address: p.address_line1 ?? null,
        city: p.city ?? p.county ?? null,
        country: p.country ?? null,
      };
    });
}
