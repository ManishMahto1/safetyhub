import { api } from './api.js';

/**
 * Forward-geocode a free-text city/place query via the server (Nominatim proxy).
 * Used when the user denies location access and wants to search by city name.
 * @param {string} q
 * @returns {Promise<Array<{ name: string, lat: number, lng: number }>>}
 */
export async function searchCity(q) {
  const query = (q || '').trim();
  if (query.length < 2) return [];
  const { data } = await api.get('/api/geocode', { params: { q: query } });
  return data.results || [];
}
