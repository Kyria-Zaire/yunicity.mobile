import { buildApp } from './app.js';
import { connectDatabase } from './config/database.js';
import { disconnectDatabase } from './config/database.js';
import { disconnectRedis } from './config/redis.js';

const PORT = Number(process.env['PORT'] ?? 3008);

async function start() {
  await connectDatabase();
  const app = await buildApp();

  try {
    await app.listen({ port: PORT, host: '0.0.0.0' });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }

  const shutdown = async (signal: string) => {
    app.log.info({ signal }, 'Graceful shutdown');
    await app.close();
    await disconnectRedis();
    await disconnectDatabase();
    process.exit(0);
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

void start();
