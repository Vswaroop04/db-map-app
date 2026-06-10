import { supabase } from './supabase';
import { type Place } from '../types/place';

export type Location = {
  id: number;
  external_id: string;
  source: string;
  name: string;
  latitude: number;
  longitude: number;
  category: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  description: string | null;
  image_url: string | null;
  created_at: string;
};

const RADIUS_DEG = 0.09; // ~10km bounding box

export async function fetchCachedPlaces(lat: number, lng: number): Promise<Place[]> {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .gte('latitude', lat - RADIUS_DEG)
    .lte('latitude', lat + RADIUS_DEG)
    .gte('longitude', lng - RADIUS_DEG)
    .lte('longitude', lng + RADIUS_DEG)
    .order('name');

  if (error) throw error;

  return (data ?? []).map((row: Location) => ({
    id: row.external_id,
    name: row.name,
    latitude: row.latitude,
    longitude: row.longitude,
    category: row.category,
    address: row.address,
    city: row.city,
    country: row.country,
  }));
}

export async function upsertPlaces(places: Place[]): Promise<void> {
  const rows = places.map((p) => ({
    external_id: p.id,
    source: 'foursquare',
    name: p.name,
    latitude: p.latitude,
    longitude: p.longitude,
    category: p.category,
    address: p.address,
    city: p.city,
    country: p.country,
  }));

  const { error } = await supabase
    .from('locations')
    .upsert(rows, { onConflict: 'external_id' });

  if (error) throw error;
}
