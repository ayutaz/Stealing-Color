import { defineConfig } from 'vite';

const basePath = process.env.VITE_BASE_PATH ?? '/';

export default defineConfig({
  base: basePath,
  server: {
    port: 5173
  },
  test: {
    include: ['src/**/*.test.ts'],
    exclude: ['tests/e2e/**']
  }
});
