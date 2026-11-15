import { defineConfig } from 'vitest/config';

export default defineConfig({
  server: { port: 3000, host: true },
  build: { target: 'es2022', chunkSizeWarningLimit: 1200 },
  test: { include: ['src/**/*.test.ts'], environment: 'node' },
});
