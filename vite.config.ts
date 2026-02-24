import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173
  },
  test: {
    include: ['src/**/*.test.ts'],
    exclude: ['tests/e2e/**']
  }
});
