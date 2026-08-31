import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    setupFiles: ['./tests/vitest/setup.ts'],
    include: ['tests/browser/**/*.spec.{ts,tsx}'],
    browser: {
      enabled: true,
      provider: playwright({ launchOptions: { headless: true } }),
      instances: [{ browser: 'chromium' }],
    },
  },
});
