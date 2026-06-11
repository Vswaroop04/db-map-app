export type Place = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  category: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
};

export type Bounds = {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
};
