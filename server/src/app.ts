import express, { Express } from 'express';
import cors from 'cors';
import { env } from './config/env';
import placesRoute from './routes/places.route';
import voiceAssistRoute from './routes/voiceAssist.route';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

export function createApp(): Express {
  const app = express();

  app.use(cors({ origin: env.clientOrigin }));
  app.use(express.json({ limit: '100kb' }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'safetyhub-server' });
  });

  app.use('/api/places', placesRoute);
  app.use('/api/voice-assist', voiceAssistRoute);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
