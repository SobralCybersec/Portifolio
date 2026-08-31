import { expect, type Page } from '@playwright/test';

export const fixtureRepos = [
  {
    id: 101,
    name: 'qa-showcase',
    description: 'Stable repository fixture for browser QA.',
    html_url: 'https://github.com/example/qa-showcase',
    homepage: 'https://example.com/qa-showcase',
    language: 'TypeScript',
    stargazers_count: 12,
    forks_count: 3,
    topics: ['react', 'testing'],
    previewImage: '/icons/typescript.png',
    techStack: ['React', 'Playwright'],
  },
  {
    id: 102,
    name: 'api-lab',
    description: 'A second deterministic project for filters and grids.',
    html_url: 'https://github.com/example/api-lab',
    homepage: null,
    language: 'Java',
    stargazers_count: 4,
    forks_count: 1,
    topics: ['spring', 'api'],
    previewImage: '/icons/java.png',
    techStack: ['Spring'],
  },
];

export async function installStableApiMocks(page: Page) {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.addInitScript(() => {
    localStorage.removeItem('bootComplete');
  });

  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    let body: unknown = {};

    if (url.pathname === '/api/github/repos') {
      body = fixtureRepos;
    } else if (url.pathname === '/api/github/stats') {
      body = { publicRepos: 42, yearsActive: 3, totalCommits: 2400 };
    } else if (url.pathname.endsWith('/readme')) {
      body = { readme: '# QA fixture\n\nStable README content for the modal.' };
    } else if (url.pathname === '/api/visitors') {
      body = { count: 123 };
    } else if (url.pathname === '/api/chat/messages') {
      body = [];
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });

  await page.route('**platform.linkedin.com/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: '',
    }),
  );
  await page.routeWebSocket(
    (url) => url.hostname === 'ws-sa1.pusher.com',
    (webSocket) => webSocket.close({ code: 1000, reason: 'stable browser fixture' }),
  );
}

export async function gotoReady(page: Page, path: string) {
  await installStableApiMocks(page);
  const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
  expect(response?.ok()).toBeTruthy();
  await expect(page.locator('main')).toBeVisible();

  if (path === '/en') {
    await expect(page.getByRole('status')).toHaveCount(0, { timeout: 10_000 });
    await expect(page.locator('.hero-eyebrow')).toContainText('Full-Stack Developer');
    await expect(page.locator('.hero-description')).toContainText('production.');
  }

  await page.evaluate(async () => {
    if (document.fonts) await document.fonts.ready;
  });
  await expect
    .poll(() => page.locator('img').evaluateAll((images) =>
      images.filter((image) => {
        const rect = image.getBoundingClientRect();
        return rect.width > 0 && rect.bottom > 0 && rect.top < window.innerHeight;
      })
        .filter((image) => !image.complete || image.naturalWidth === 0)
        .map((image) => ({ src: image.currentSrc || image.src, complete: image.complete, naturalWidth: image.naturalWidth })),
    ))
    .toEqual([]);
  await page.evaluate(() => window.scrollTo(0, 0));
}

export async function prepareFullPageVisual(page: Page) {
  await page.evaluate(async () => {
    if (document.fonts) await document.fonts.ready;
    const images = Array.from(document.images);
    for (const image of images) {
      image.scrollIntoView({ block: 'center' });
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    }
    window.scrollTo(0, 0);
  });
  await expect
    .poll(() => page.locator('img').evaluateAll((images) =>
      images.filter((image) => image.getBoundingClientRect().width > 0)
        .filter((image) => !image.complete || image.naturalWidth === 0)
        .map((image) => image.currentSrc || image.src),
    ))
    .toEqual([]);
}

export async function stabilizeVisualLayers(page: Page) {
  await page.addStyleTag({ content: 'canvas { display: none !important; }' });
}

export async function expectNoHorizontalOverflow(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
    )
    .toBe(true);
}

export function collectRuntimeErrors(page: Page) {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const knownDevelopmentWarning = 'Encountered a script tag while rendering React component.';
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().startsWith(knownDevelopmentWarning)) {
      consoleErrors.push(message.text());
    }
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  return { consoleErrors, pageErrors };
}

export const maskedVisualOptions = (page: Page) => ({
  animations: 'disabled' as const,
  caret: 'hide' as const,
  scale: 'css' as const,
  mask: [
    page.locator('canvas'),
    page.locator('img[src$=".gif"]'),
    page.locator('video'),
    page.locator('.metrics-ticker-wrapper'),
  ],
  maskColor: '#000000',
});
