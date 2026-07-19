import axios from 'axios';
import { cacheService } from './cache.service';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

// Nominatim's usage policy requires a descriptive User-Agent identifying the
// app + a contact. Keep this honest if you fork/deploy SafetyHub.
const USER_AGENT = 'SafetyHub/0.1 (https://github.com/ManishMahto1/safetyhub)';

export interface GeocodeResult {
  name: string;
  lat: number;
  lng: number;
}

/**
 * Forward-geocodes a free-text place/city query via Nominatim (OSM), so users
 * who deny location access can still search by city name. Proxied through the
 * server (never the browser) to keep a single honest User-Agent and to cache
 * results — Nominatim's policy is max ~1 req/sec.
 * Returns [] on any failure; callers show a "no matches" state, never an error.
 */
export async function geocodePlace(query: string, limit = 5): Promise<GeocodeResult[]> {
  const q = query.trim();
  if (!q) return [];

  const cacheKey = `geocode:${q.toLowerCase()}`;

  try {
    return await cacheService.wrap(cacheKey, 24 * 60 * 60 * 1000, async () => {
      const { data } = await axios.get(NOMINATIM_URL, {
        params: { q, format: 'jsonv2', limit, addressdetails: 0 },
        headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'en' },
        timeout: 8000,
      });

      const rows: Array<{ display_name?: string; lat?: string; lon?: string }> = Array.isArray(data)
        ? data
        : [];

      return rows
        .map((row) => ({
          name: row.display_name || '',
          lat: Number(row.lat),
          lng: Number(row.lon),
        }))
        .filter((r) => r.name && Number.isFinite(r.lat) && Number.isFinite(r.lng));
    });
  } catch {
    return [];
  }
}
