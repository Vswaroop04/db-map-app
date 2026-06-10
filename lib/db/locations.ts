import { supabase } from './supabase';

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

export async function fetchLocations(): Promise<Location[]> {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .order('name');

  if (error) throw error;
  return data ?? [];
}
