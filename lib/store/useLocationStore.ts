import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { create } from 'zustand';
import { fetchCachedPlaces, upsertPlaces } from '../db/locations';
import { fetchNearbyPlaces } from '../services/foursquare';
import { type Place, type Bounds } from '../types/place';

export type { Place } from '../types/place';
export type { Bounds } from '../types/place';

const WORKER_URL = process.env.EXPO_PUBLIC_WORKER_URL ?? '';

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
  fetchByBounds: (bounds: Bounds) => Promise<void>;
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

      let places: Place[];

      if (Platform.OS === 'web') {
        const res = await fetch(`${WORKER_URL}/locations?ll=${latitude},${longitude}&radius=5000`);
        places = await res.json();
      } else {
        places = await fetchCachedPlaces(latitude, longitude);
        if (places.length === 0) {
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
      }

      const categories = [
        ...new Set(places.map((p) => p.category).filter(Boolean) as string[]),
      ].sort();

      set({ places, filteredPlaces: places, categories, loading: false });
    } catch {
      set({ error: 'Failed to load nearby places.', loading: false });
    }
  },

  fetchByBounds: async (bounds) => {
    try {
      const { minLat, maxLat, minLon, maxLon } = bounds;
      const res = await fetch(
        `${WORKER_URL}/locations?minLat=${minLat}&maxLat=${maxLat}&minLon=${minLon}&maxLon=${maxLon}`
      );
      const places: Place[] = await res.json();
      if (!places.length) return;
      const { selectedCategory } = get();
      const categories = [
        ...new Set(places.map((p) => p.category).filter(Boolean) as string[]),
      ].sort();
      set({
        places,
        filteredPlaces: selectedCategory
          ? places.filter((p) => p.category === selectedCategory)
          : places,
        categories,
      });
    } catch {}
  },

  setCategory: (category) => {
    const { places } = get();
    set({
      selectedCategory: category,
      filteredPlaces: category ? places.filter((p) => p.category === category) : places,
    });
  },

  setActiveId: (id) => set({ activeId: id }),
}));
