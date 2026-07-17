import { Router } from 'express';
import { postVoiceAssist } from '../controllers/voiceAssist.controller';
import { asyncHandler } from '../utils/asyncHandler';
import { voiceAssistRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// POST /api/voice-assist { transcript, location }
router.post('/', voiceAssistRateLimiter, asyncHandler(postVoiceAssist));

export default router;
