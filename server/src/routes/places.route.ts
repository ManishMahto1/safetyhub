import { Router } from 'express';
import { getPlaces } from '../controllers/places.controller';
import { asyncHandler } from '../utils/asyncHandler';
import { placesRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// GET /api/places?lat=&lng=&category=&radius=
router.get('/', placesRateLimiter, asyncHandler(getPlaces));

export default router;
