const API_KEY = process.env.EXPO_PUBLIC_FOURSQUARE_API_KEY;

export type FoursquarePlace = {
  fsq_place_id: string;
  name: string;
  latitude: number;
  longitude: number;
  categories: Array<{ name: string; icon: { prefix: string; suffix: string } }>;
  location: {
    address?: string;
    locality?: string;
    country?: string;
    formatted_address?: string;
  };
};

export async function fetchNearbyPlaces(lat: number, lng: number): Promise<FoursquarePlace[]> {
  const url = `https://places-api.foursquare.com/places/search?query=landmark&ll=${lat},${lng}&radius=10000&limit=20`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'X-Places-Api-Version': '2025-06-17',
      accept: 'application/json',
    },
  });
  if (!res.ok) throw new Error(`Foursquare error ${res.status}`);
  const data = await res.json();
  return data.results ?? [];
}
