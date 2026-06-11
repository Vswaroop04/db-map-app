export interface Env {
  FOURSQUARE_API_KEY: string;
}

type FoursquarePlace = {
  fsq_place_id: string;
  name: string;
  latitude: number;
  longitude: number;
  categories: Array<{ name: string }>;
  location: { address?: string; locality?: string; country?: string };
};

type Place = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  category: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
};

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const FS_BASE = 'https://places-api.foursquare.com/places';
const FIELDS = 'fsq_place_id,name,latitude,longitude,categories,location';

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

function mapPlace(f: FoursquarePlace): Place {
  return {
    id: f.fsq_place_id,
    name: f.name,
    latitude: f.latitude,
    longitude: f.longitude,
    category: f.categories[0]?.name ?? null,
    address: f.location.address ?? null,
    city: f.location.locality ?? null,
    country: f.location.country ?? null,
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const headers = {
      Authorization: `Bearer ${env.FOURSQUARE_API_KEY}`,
      'X-Places-Api-Version': '2025-06-17',
      Accept: 'application/json',
    };

    // GET /locations?ll=lat,lng&radius=meters
    // GET /locations?minLat=&maxLat=&minLon=&maxLon=
    if (path === '/locations' && request.method === 'GET') {
      const p = url.searchParams;
      let ll: string;
      let radius: number;

      if (p.has('ll')) {
        ll = p.get('ll')!;
        radius = Math.min(parseInt(p.get('radius') ?? '5000'), 50000);
      } else {
        const minLat = parseFloat(p.get('minLat') ?? '0');
        const maxLat = parseFloat(p.get('maxLat') ?? '0');
        const minLon = parseFloat(p.get('minLon') ?? '0');
        const maxLon = parseFloat(p.get('maxLon') ?? '0');
        const cLat = (minLat + maxLat) / 2;
        const cLon = (minLon + maxLon) / 2;
        ll = `${cLat},${cLon}`;
        const latR = ((maxLat - minLat) / 2) * 111000;
        const lonR = ((maxLon - minLon) / 2) * 111000 * Math.cos((cLat * Math.PI) / 180);
        radius = Math.min(Math.max(latR, lonR), 50000);
      }

      const fsUrl = `${FS_BASE}/search?query=landmark&ll=${ll}&radius=${Math.round(radius)}&limit=50&fields=${FIELDS}`;
      const res = await fetch(fsUrl, { headers });
      if (!res.ok) return json({ error: 'upstream error' }, 502);
      const data: { results: FoursquarePlace[] } = await res.json();
      return json((data.results ?? []).map(mapPlace));
    }

    // GET /locations/:id
    const match = path.match(/^\/locations\/([^/]+)$/);
    if (match && request.method === 'GET') {
      const id = match[1];
      const fsUrl = `${FS_BASE}/${id}?fields=${FIELDS}`;
      const res = await fetch(fsUrl, { headers });
      if (res.status === 404) return json({ error: 'not found' }, 404);
      if (!res.ok) return json({ error: 'upstream error' }, 502);
      const place: FoursquarePlace = await res.json();
      return json(mapPlace(place));
    }

    return json({ error: 'not found' }, 404);
  },
};
