import { buildApp } from './app.js';
import { startEmailWorker } from './workers/email.worker.js';
import { initSocketServer } from './realtime/socket.js';
import { env } from './config/env.js';

async function start(): Promise<void> {
  const app = await buildApp();

  // Démarrer le worker BullMQ pour les emails
  const emailWorker = startEmailWorker();
  console.log('📧 Email worker démarré (queue: emails)');

  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }

  // Initialiser Socket.io après le listen (nécessite app.server)
  initSocketServer(app);
  console.log('🔌 Socket.io initialisé');

  const shutdown = async (signal: string): Promise<void> => {
    app.log.info({ signal }, 'Shutdown notification-service');
    await emailWorker.close();
    await app.close();
    process.exit(0);
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

void start();
