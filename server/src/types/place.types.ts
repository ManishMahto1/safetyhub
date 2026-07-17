export type PlaceCategory =
  | 'hospital'
  | 'pharmacy'
  | 'police'
  | 'bank'
  | 'fuel'
  | 'fire-station';

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  lat: number;
  lng: number;
  photoUrl: string | null;
  address?: string;
  phone?: string;
}

export interface PlacesQuery {
  lat: number;
  lng: number;
  category: PlaceCategory | 'all';
  radius: number; // meters
}
