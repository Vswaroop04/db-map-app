import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { create } from 'zustand';
import { fetchCachedPlaces, upsertPlaces } from '../db/locations';
import { fetchNearbyPlaces } from '../services/foursquare';
import { type Place } from '../types/place';

export type { Place } from '../types/place';

type LocationStore = {
  places: Place[];
  filteredPlaces: Place[];
  categories: string[];
  selectedCategory: string | null;
  userLocation: { latitude: number; longitude: number } | null;
  activeId: string | null;
  loading: boolean;
  error: string | null;
  fetchNearby: () => Promise<void>;
  setCategory: (category: string | null) => void;
  setActiveId: (id: string | null) => void;
};

export const useLocationStore = create<LocationStore>((set, get) => ({
  places: [],
  filteredPlaces: [],
  categories: [],
  selectedCategory: null,
  userLocation: null,
  activeId: null,
  loading: false,
  error: null,

  fetchNearby: async () => {
    set({ loading: true, error: null });
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        set({ error: 'Location permission required to find nearby places.', loading: false });
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = loc.coords;
      set({ userLocation: { latitude, longitude } });

      let places: Place[] = await fetchCachedPlaces(latitude, longitude);

      // on web, Foursquare blocks browser requests (CORS) — read from Supabase cache only
      if (places.length === 0 && Platform.OS !== 'web') {
        const results = await fetchNearbyPlaces(latitude, longitude);
        places = results.map((r) => ({
          id: r.fsq_place_id,
          name: r.name,
          latitude: r.latitude,
          longitude: r.longitude,
          category: r.categories[0]?.name ?? null,
          address: r.location.address ?? null,
          city: r.location.locality ?? null,
          country: r.location.country ?? null,
        }));
        upsertPlaces(places).catch(() => {});
      }

      const categories = [
        ...new Set(places.map((p) => p.category).filter(Boolean) as string[]),
      ].sort();

      set({ places, filteredPlaces: places, categories, loading: false });
    } catch {
      set({ error: 'Failed to load nearby places.', loading: false });
    }
  },

  setCategory: (category) => {
    const { places } = get();
    set({
      selectedCategory: category,
      filteredPlaces: category
        ? places.filter((p) => p.category === category)
        : places,
    });
  },

  setActiveId: (id) => set({ activeId: id }),
}));
