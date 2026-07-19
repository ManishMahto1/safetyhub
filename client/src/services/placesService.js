import { api } from './api.js';

/**
 * @param {{ lat: number, lng: number, category?: string, radius?: number }} params
 * @returns {Promise<{ places: Array<{id:string, name:string, category:string, lat:number, lng:number, photoUrl:string|null, address?:string, phone?:string}>, source: 'overpass' | 'fallback' }>}
 */
export async function fetchNearbyPlaces({ lat, lng, category = 'all', radius = 3000 }) {
  const { data } = await api.get('/api/places', {
    params: { lat, lng, category, radius },
  });
  return { places: data.places, source: data.source };
}
