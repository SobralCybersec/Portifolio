import { defineConfig, devices } from '@playwright/test';

const isCI = Boolean(process.env.CI);

const desktopViewport = {
  width: 1366,
  height: 768,
};

const mobileViewport = {
  width: 390,
  height: 844,
};

const ciRuntimeEnv = [
  'AUTH_SECRET=ci-test-auth-secret-0123456789012345678901',
  'AUTH_TRUST_HOST=true',
  'AUTH_GITHUB_ID=ci-test-github-id',
  'AUTH_GITHUB_SECRET=ci-test-github-secret',
  'UPSTASH_REDIS_REST_URL=https://ci.invalid',
  'UPSTASH_REDIS_REST_TOKEN=ci-test-upstash-token',
].join(' ');

export default defineConfig({
  testDir: './tests',
  outputDir: 'test-results',

  fullyParallel: isCI,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: 1,

  timeout: 45_000,

  expect: {
    timeout: 10_000,
  },

  reporter: [
    ['list'],
    ['html', {
      outputFolder: 'playwright-report',
      open: 'never',
    }],
  ],

  use: {
    baseURL: 'http://127.0.0.1:3000',

    actionTimeout: 10_000,
    navigationTimeout: 30_000,

    colorScheme: 'dark',
    locale: 'en-US',
    timezoneId: 'UTC',

    serviceWorkers: 'block',

    trace: isCI ? 'on-first-retry' : 'off',
    screenshot: 'only-on-failure',
    video: isCI ? 'retain-on-failure' : 'off',
  },

  projects: [
    /*
     * Keep this project name as "chromium".
     *
     * Existing screenshot baselines use filenames such as:
     * homepage-desktop-chromium-linux.png
     *
     * Renaming this project would create a completely new baseline set.
     */
    {
      name: 'chromium',
      testMatch: '**/visual/**/*.visual.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        viewport: desktopViewport,
      },
    },

    {
      name: 'chromium-e2e',
      testMatch: [
        '**/e2e/**/*.spec.ts',
        '**/accessibility/**/*.spec.ts',
      ],
      use: {
        ...devices['Desktop Chrome'],
        viewport: desktopViewport
      },
    },

    {
      name: 'chromium-mobile',
      testMatch: '**/e2e/**/*.spec.ts',
      use: {
        ...devices['Pixel 5'],
        viewport: mobileViewport
      },
    },

    {
      name: 'firefox',
      testMatch: '**/e2e/**/*.spec.ts',
      use: {
        ...devices['Desktop Firefox'],
        viewport: desktopViewport
      },
    },

    {
      name: 'webkit',
      testMatch: '**/e2e/**/*.spec.ts',
      use: {
        ...devices['Desktop Safari'],
        viewport: desktopViewport
      },
    },

    {
      name: 'video',
      testMatch: '**/video/**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        viewport: desktopViewport,
        video: {
          mode: 'on',
          size: desktopViewport,
        },
        trace: 'retain-on-failure',
      },
    },
  ],

  webServer: {
    command: isCI
      ? `${ciRuntimeEnv} HOSTNAME=127.0.0.1 PORT=3000 node scripts/qa/start-production.mjs`
      : 'pnpm dev --hostname 127.0.0.1 --port 3000',

    url: 'http://127.0.0.1:3000/en',

    reuseExistingServer: !isCI,

    timeout: 120_000,

    stdout: 'ignore',
    stderr: 'pipe',
  },
});
