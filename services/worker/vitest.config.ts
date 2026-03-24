import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 20000,
    hookTimeout: 15000,
    pool: 'forks',
    poolOptions: { forks: { singleFork: true } },
    env: {
      NODE_ENV: 'test',
      REDIS_URL: 'redis://localhost:6379',
      USER_SERVICE_URL: 'http://localhost:3002',
      NOTIFICATION_SERVICE_URL: 'http://localhost:3006',
      ADMIN_API_KEY: 'test_admin_key_yunicity',
    },
  },
});
