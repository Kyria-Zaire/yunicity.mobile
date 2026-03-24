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
      AUTH_SECRET: 'test_secret_min_32_chars_yunicity_ok',
      DATABASE_URL: 'postgresql://yunicity:changeme_local@localhost:5432/yunicity_test',
      REDIS_URL: 'redis://localhost:6379',
      CORS_ORIGINS: 'http://localhost:3010',
    },
  },
});
