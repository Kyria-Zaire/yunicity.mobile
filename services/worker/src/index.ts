import { buildApp } from './app.js';
import { startScheduler, stopScheduler } from './scheduler.js';
import { disconnectRedis } from './config/redis.js';

const PORT = Number(process.env['PORT'] ?? 3009);

async function start() {
  const app = await buildApp();

  try {
    await app.listen({ port: PORT, host: '0.0.0.0' });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }

  startScheduler(app.log);
  app.log.info('Worker scheduler started');

  const shutdown = async (signal: string) => {
    app.log.info({ signal }, 'Graceful shutdown');
    stopScheduler();
    await app.close();
    await disconnectRedis();
    process.exit(0);
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

void start();
