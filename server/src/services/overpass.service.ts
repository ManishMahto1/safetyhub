import axios from 'axios';
import { Place, PlaceCategory } from '../types/place.types';
import { cacheService } from './cache.service';
import { lookupPhoto } from './photo.service';

// Public Overpass instances are frequently overloaded (504) or rate-limited.
// Try several mirrors in order so a single slow instance doesn't drop us to the
// static fallback.
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
];

// Overpass rejects the raw-body POST with 406; it wants the query as a
// form-encoded `data=` field and a descriptive User-Agent.
const OVERPASS_HEADERS = {
  'Content-Type': 'application/x-www-form-urlencoded',
  Accept: 'application/json',
  'User-Agent': 'SafetyHub/0.1 (https://github.com/ManishMahto1/safetyhub)',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function postOverpass(query: string): Promise<any> {
  const body = new URLSearchParams({ data: query }).toString();
  let lastErr: unknown;
  for (const url of OVERPASS_ENDPOINTS) {
    try {
      const { data } = await axios.post(url, body, {
        headers: OVERPASS_HEADERS,
        timeout: 20000,
      });
      return data;
    } catch (err) {
      lastErr = err;
      // eslint-disable-next-line no-console
      console.warn(`[overpass] ${url} failed: ${(err as Error).message} — trying next mirror`);
    }
  }
  throw lastErr;
}

// Maps our category ids to OSM tag queries
const CATEGORY_TAGS: Record<Exclude<PlaceCategory, never>, string[]> = {
  hospital: ['amenity=hospital'],
  pharmacy: ['amenity=pharmacy'],
  police: ['amenity=police'],
  bank: ['amenity=bank'],
  fuel: ['amenity=fuel'],
  'fire-station': ['amenity=fire_station'],
};

function buildOverpassQuery(lat: number, lng: number, radius: number, categories: PlaceCategory[]) {
  const clauses = categories
    .flatMap((cat) => CATEGORY_TAGS[cat])
    .map((tag) => {
      const [key, value] = tag.split('=');
      return `node["${key}"="${value}"](around:${radius},${lat},${lng});`;
    })
    .join('\n');

  return `[out:json][timeout:15];(${clauses});out center 40;`;
}

function categoryFromTags(tags: Record<string, string>): PlaceCategory | null {
  const amenity = tags.amenity;
  if (amenity === 'hospital') return 'hospital';
  if (amenity === 'pharmacy') return 'pharmacy';
  if (amenity === 'police') return 'police';
  if (amenity === 'bank') return 'bank';
  if (amenity === 'fuel') return 'fuel';
  if (amenity === 'fire_station') return 'fire-station';
  return null;
}

/**
 * Queries Overpass for nearby places matching one or all categories.
 * Cached briefly per (lat,lng,radius,category) bucket to be polite to the
 * public Overpass instance and keep the map feeling snappy.
 */
export async function queryOverpass(
  lat: number,
  lng: number,
  radius: number,
  category: PlaceCategory | 'all'
): Promise<Place[]> {
  const categories: PlaceCategory[] =
    category === 'all' ? (Object.keys(CATEGORY_TAGS) as PlaceCategory[]) : [category];

  const cacheKey = `overpass:${lat.toFixed(3)}:${lng.toFixed(3)}:${radius}:${category}`;

  return cacheService.wrap(cacheKey, 5 * 60 * 1000, async () => {
    const query = buildOverpassQuery(lat, lng, radius, categories);
    const data = await postOverpass(query);

    const elements: Array<{
      id: number;
      lat?: number;
      lon?: number;
      center?: { lat: number; lon: number };
      tags?: Record<string, string>;
    }> = data.elements || [];

    const places = await Promise.all(
      elements.map(async (el) => {
        const tags = el.tags || {};
        const placeCategory = categoryFromTags(tags);
        if (!placeCategory) return null;

        const placeLat = el.lat ?? el.center?.lat;
        const placeLng = el.lon ?? el.center?.lon;
        if (placeLat === undefined || placeLng === undefined) return null;

        const photoUrl = await lookupPhoto(tags);

        const place: Place = {
          id: `osm-${el.id}`,
          name: tags.name || defaultNameFor(placeCategory),
          category: placeCategory,
          lat: placeLat,
          lng: placeLng,
          photoUrl,
          address: buildAddress(tags),
          phone: tags.phone || tags['contact:phone'],
        };
        return place;
      })
    );

    return places.filter((p): p is Place => p !== null);
  });
}

function defaultNameFor(category: PlaceCategory): string {
  const labels: Record<PlaceCategory, string> = {
    hospital: 'Hospital',
    pharmacy: 'Pharmacy',
    police: 'Police station',
    bank: 'Bank',
    fuel: 'Fuel station',
    'fire-station': 'Fire station',
  };
  return labels[category];
}

function buildAddress(tags: Record<string, string>): string | undefined {
  const parts = [tags['addr:housenumber'], tags['addr:street'], tags['addr:city']].filter(Boolean);
  return parts.length ? parts.join(' ') : undefined;
}
