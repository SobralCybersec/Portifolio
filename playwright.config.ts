import { defineConfig, devices } from '@playwright/test';

const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 2 : undefined,
  timeout: 45_000,
  expect: {
    timeout: 10_000,
  },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  use: {
    baseURL: 'http://127.0.0.1:3000',
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
    colorScheme: 'dark',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      testMatch: /.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 768 } },
    },
    {
      name: 'chromium-mobile',
      testMatch: /tests\/e2e\/.*\.spec\.ts/,
      use: { ...devices['Pixel 5'], viewport: { width: 390, height: 844 } },
    },
    {
      name: 'firefox',
      testMatch: /tests\/e2e\/.*\.spec\.ts/,
      use: { ...devices['Desktop Firefox'], viewport: { width: 1366, height: 768 } },
    },
    {
      name: 'webkit',
      testMatch: /tests\/e2e\/.*\.spec\.ts/,
      use: { ...devices['Desktop Safari'], viewport: { width: 1366, height: 768 } },
    },
  ],
  webServer: {
    command: isCI ? 'pnpm start' : 'pnpm dev --hostname 127.0.0.1',
    url: 'http://127.0.0.1:3000/en',
    reuseExistingServer: !isCI,
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
