import { create } from 'zustand';
import { fetchLocations, type Location } from '../db/locations';

type LocationStore = {
  locations: Location[];
  filteredLocations: Location[];
  categories: string[];
  selectedCategory: string | null;
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  setCategory: (category: string | null) => void;
};

export const useLocationStore = create<LocationStore>((set, get) => ({
  locations: [],
  filteredLocations: [],
  categories: [],
  selectedCategory: null,
  loading: false,
  error: null,

  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const data = await fetchLocations();
      const categories = [
        ...new Set(data.map((l) => l.category).filter(Boolean) as string[]),
      ].sort();
      set({ locations: data, filteredLocations: data, categories, loading: false });
    } catch (e) {
      set({ error: 'Failed to load locations', loading: false });
    }
  },

  setCategory: (category) => {
    const { locations } = get();
    set({
      selectedCategory: category,
      filteredLocations: category
        ? locations.filter((l) => l.category === category)
        : locations,
    });
  },
}));
