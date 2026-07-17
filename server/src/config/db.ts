import mongoose from 'mongoose';
import { env } from './env';

let hasWarned = false;

/**
 * Connects to MongoDB. Mongo is used minimally in this project (optional
 * interaction logging), so a failed connection should not crash the API —
 * places and voice-assist both work without it. We log once and move on.
 */
export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(env.mongoUri);
    // eslint-disable-next-line no-console
    console.log('[db] connected to MongoDB');
  } catch (err) {
    if (!hasWarned) {
      // eslint-disable-next-line no-console
      console.warn(
        '[db] could not connect to MongoDB — continuing without interaction logging.',
        (err as Error).message
      );
      hasWarned = true;
    }
  }
}
