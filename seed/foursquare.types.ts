export interface ApiResult {
  results: Result[];
  context: Context;
}

export interface Result {
  fsq_place_id: string;
  latitude: number;
  longitude: number;
  categories: Category[];
  date_created: string;
  date_refreshed: string;
  distance: number;
  extended_location: ExtendedLocation;
  link: string;
  location: Location;
  name: string;
  placemaker_url: string;
  related_places: RelatedPlaces;
  social_media: SocialMedia;
  store_id: string;
  tel: string;
  website: string;
}

export interface Category {
  fsq_category_id: string;
  name: string;
  short_name: string;
  plural_name: string;
  icon: Icon;
}

export interface Icon {
  prefix: string;
  suffix: string;
}

export interface ExtendedLocation {}

export interface Location {
  address: string;
  locality: string;
  region: string;
  postcode: string;
  admin_region: string;
  country: string;
  formatted_address: string;
}

export interface RelatedPlaces {
  children: Children[];
}

export interface Children {
  fsq_place_id: string;
  categories: Category2[];
  name: string;
}

export interface Category2 {
  fsq_category_id: string;
  name: string;
  short_name: string;
  plural_name: string;
  icon: Icon2;
}

export interface Icon2 {
  prefix: string;
  suffix: string;
}

export interface SocialMedia {
  facebook_id: string;
  twitter: string;
}

export interface Context {
  geo_bounds: GeoBounds;
}

export interface GeoBounds {
  circle: Circle;
}

export interface Circle {
  center: Center;
  radius: number;
}

export interface Center {
  latitude: number;
  longitude: number;
}
