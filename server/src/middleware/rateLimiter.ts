import rateLimit from 'express-rate-limit';

/** General limiter for the places endpoint — generous, it's read-only. */
export const placesRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests — please slow down.' },
});

/** Tighter limiter for voice-assist since each request costs an LLM call. */
export const voiceAssistRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many voice requests — please wait a moment and try again.' },
});
