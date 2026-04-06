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
      DATABASE_URL: 'postgresql://test:test@localhost:5432/yunicity_test',
      REDIS_URL: 'redis://localhost:6379',
      AUTH_SECRET: 'test_secret_min_32_chars_yunicity_ok',
      ADMIN_API_KEY: 'test_admin_key_min_32_chars_yunicity_ok',
    },
  },
});
