import { Request, Response } from 'express';
import { queryOverpass } from '../services/overpass.service';
import { PlaceCategory } from '../types/place.types';
import fallbackPlaces from '../data/fallbackPlaces.json';

const VALID_CATEGORIES = new Set<PlaceCategory>([
  'hospital',
  'pharmacy',
  'police',
  'bank',
  'fuel',
  'fire-station',
]);

export async function getPlaces(req: Request, res: Response): Promise<void> {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const radius = Number(req.query.radius) || 3000;
  const categoryParam = String(req.query.category || 'all');

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    res.status(400).json({ message: 'lat and lng query params are required and must be numbers' });
    return;
  }

  const category: PlaceCategory | 'all' =
    categoryParam === 'all' || VALID_CATEGORIES.has(categoryParam as PlaceCategory)
      ? (categoryParam as PlaceCategory | 'all')
      : 'all';

  try {
    const places = await queryOverpass(lat, lng, radius, category);
    res.json({ places, source: 'overpass' });
  } catch (err) {
    // Overpass can be flaky/rate-limited — fall back to the static demo
    // dataset so the map still shows something during a live demo.
    // eslint-disable-next-line no-console
    console.warn('[places] Overpass query failed, using fallback data:', (err as Error).message);
    const filtered =
      category === 'all'
        ? fallbackPlaces
        : fallbackPlaces.filter((p) => p.category === category);
    res.json({ places: filtered, source: 'fallback' });
  }
}
