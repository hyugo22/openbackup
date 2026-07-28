import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://openbackup:openbackup@localhost:5432/openbackup_test',
      JWT_SECRET: 'test-secret-utilise-uniquement-pour-les-tests-unitaires',
      CORS_ORIGIN: 'http://localhost:5173',
    },
  },
});
