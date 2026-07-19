import { Request, Response } from 'express';
import { geocodePlace } from '../services/geocode.service';

export async function getGeocode(req: Request, res: Response): Promise<void> {
  const q = String(req.query.q || '').trim();

  if (q.length < 2) {
    res.status(400).json({ message: 'query param "q" is required (min 2 characters)' });
    return;
  }

  const results = await geocodePlace(q);
  res.json({ results });
}
