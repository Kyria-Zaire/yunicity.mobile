import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 20000,
    hookTimeout: 15000,
    // Forcer les env vars avant que les modules soient chargés
    env: {
      NODE_ENV: 'test',
      AUTH_SECRET: 'test_secret_min_32_chars_yunicity_ok',
      REDIS_URL: 'redis://localhost:6379',
      CORS_ORIGINS: 'http://localhost:3000',
    },
    // Isolation par fichier pour éviter les conflits de state entre suites
    isolate: true,
    // Un seul thread pour éviter les conflits de port sur Windows
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
});
