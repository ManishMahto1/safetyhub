import { api } from './api.js';

/**
 * @param {{ lat: number, lng: number, category?: string, radius?: number }} params
 * @returns {Promise<Array<{id:string, name:string, category:string, lat:number, lng:number, photoUrl:string|null, address?:string}>>}
 */
export async function fetchNearbyPlaces({ lat, lng, category = 'all', radius = 3000 }) {
  const { data } = await api.get('/api/places', {
    params: { lat, lng, category, radius },
  });
  return data.places;
}
