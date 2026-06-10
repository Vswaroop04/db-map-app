import * as dotenv from "dotenv";
import { ApiResult } from "./foursquare.types";

dotenv.config({ path: ".env" });

const API_KEY = process.env.FOURSQUARE_API_KEY;
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

type LocationInsert = {
  external_id: string;
  source: string;
  name: string;
  latitude: number;
  longitude: number;
  category: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  description: null;
  image_url: null;
  raw_data: unknown;
};

async function fetchPlaces(query: string): Promise<ApiResult["results"]> {
  const res = await fetch(
    `https://places-api.foursquare.com/places/search?query=${query}&near=London&limit=10`,
    {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "X-Places-Api-Version": "2025-06-17",
        accept: "application/json",
      },
    }
  );
  if (!res.ok) throw new Error(`Foursquare error ${res.status}`);
  const data = (await res.json()) as ApiResult;
  return data.results;
}

function mapToRow(result: ApiResult["results"][0]): LocationInsert {
  return {
    external_id: result.fsq_place_id,
    source: "foursquare",
    name: result.name,
    latitude: result.latitude,
    longitude: result.longitude,
    category: result.categories[0]?.name ?? null,
    address: result.location.address ?? null,
    city: result.location.locality ?? null,
    country: result.location.country ?? null,
    description: null,
    image_url: null,
    raw_data: result,
  };
}

async function upsert(rows: LocationInsert[]) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/locations?on_conflict=external_id`,
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY!,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify(rows),
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase error ${res.status}: ${err}`);
  }
}

async function seed() {
  console.log("fetching from foursquare...");

  const queries = ["landmark", "museum", "park"];
  const batches = await Promise.all(queries.map(fetchPlaces))
  const flatlist = batches.flat();

  const set = new Set<string>();
  const unique = flatlist.filter((r) => {
    if (set.has(r.fsq_place_id)) return false
    set.add(r.fsq_place_id)
    return true
  })
  const rows = unique.map(mapToRow);
  console.log(`upserting ${rows.length} locations to supabase...`);
  await upsert(rows);
  console.log("done");
}

seed().catch(console.error);
