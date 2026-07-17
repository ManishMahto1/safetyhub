import { createApp } from './app';
import { connectDatabase } from './config/db';
import { env } from './config/env';

async function main() {
  await connectDatabase();

  const app = createApp();
  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] SafetyHub API listening on port ${env.port}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[server] fatal startup error', err);
  process.exit(1);
});
