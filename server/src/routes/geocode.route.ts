import { Router } from 'express';
import { getGeocode } from '../controllers/geocode.controller';
import { asyncHandler } from '../utils/asyncHandler';
import { geocodeRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// GET /api/geocode?q=<city or place name>
router.get('/', geocodeRateLimiter, asyncHandler(getGeocode));

export default router;
