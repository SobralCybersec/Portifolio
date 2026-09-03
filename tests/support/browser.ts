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
    allLanguages: ['typescript'],
    techStack: ['React', 'Playwright'],
    owner: {
      login: 'example',
    },
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
    allLanguages: ['java'],
    techStack: ['Spring'],
    owner: {
      login: 'example',
    },
  },
] as const;

interface StableMocksOptions {
  reducedMotion?: boolean;
}

interface GotoReadyOptions extends StableMocksOptions {}

async function waitForVisibleImages(page: Page) {
  await expect
    .poll(
      () =>
        page.locator('img').evaluateAll((images) =>
        images
            .filter((image) => {
              const rect = image.getBoundingClientRect();

              return (
                rect.width > 0 &&
                rect.height > 0 &&
                rect.bottom > 0 &&
                rect.top < window.innerHeight
              );
            })
            .filter(
              (image) => {
                const imageElement = image as HTMLImageElement;

                return (
                  !imageElement.complete ||
                  imageElement.naturalWidth === 0 ||
                  imageElement.naturalHeight === 0
                );
              },
            )
            .map((image) => {
              const imageElement = image as HTMLImageElement;

              return {
                src: imageElement.currentSrc || imageElement.src,
                complete: imageElement.complete,
                naturalWidth: imageElement.naturalWidth,
                naturalHeight: imageElement.naturalHeight,
              };
            }),
        ),
      {
        message: 'visible images should finish loading',
      },
    )
    .toEqual([]);
}

async function waitForPageEntry(page: Page) {
  await expect(page.locator('.portfolio-transition')).toHaveCount(0, {
    timeout: 10_000,
  });

  await page.evaluate(async () => {
    const finiteAnimations = document
      .getAnimations()
      .filter((animation) => {
        const iterations = animation.effect?.getComputedTiming().iterations;

        return iterations !== Infinity;
      });

    await Promise.all(
      finiteAnimations.map((animation) =>
        animation.finished.catch(() => undefined),
      ),
    );
  });

  // Preserve final animation frame before visual and interaction assertions.
  await page.waitForTimeout(400);
}

export async function installStableApiMocks(
  page: Page,
  {
    reducedMotion = false,
  }: StableMocksOptions = {},
) {
  await page.emulateMedia({
    colorScheme: 'dark',
    reducedMotion: reducedMotion ? 'reduce' : 'no-preference',
  });

  await page.addInitScript(() => {
    localStorage.removeItem('bootComplete');
  });

  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());

    let body: unknown;

    switch (url.pathname) {
      case '/api/github/repos':
        body = fixtureRepos;
        break;

      case '/api/github/stats':
        body = {
          publicRepos: 42,
          yearsActive: 3,
          totalCommits: 2400,
        };
        break;

      case '/api/visitors':
        body = {
          count: 123,
        };
        break;

      case '/api/chat/messages':
        body = [];
        break;

      case '/api/auth/session':
        body = null;
        break;

      default:
        if (url.pathname.endsWith('/readme')) {
          body = {
            readme:
              '# QA fixture\n\nStable README content for the modal.',
          };

          break;
        }

        await route.fallback();
        return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });

  await page.route('**platform.linkedin.com/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: '',
    });
  });

  await page.routeWebSocket(
    (url) => url.hostname === 'ws-sa1.pusher.com',
    (webSocket) => {
      webSocket.close({
        code: 1000,
        reason: 'stable browser fixture',
      });
    },
  );
}

export async function gotoReady(
  page: Page,
  path: string,
  options: GotoReadyOptions = {},
) {
  await installStableApiMocks(page, options);

  const response = await page.goto(path, {
    waitUntil: 'domcontentloaded',
  });

  expect(
    response?.ok(),
    `Navigation to ${path} should return a successful response`,
  ).toBe(true);

  // Next's development indicator is external to the app and appears
  // nondeterministically in screenshots depending on dev-server timing.
  await page.addStyleTag({
    content: 'nextjs-portal, [data-nextjs-toast], [data-nextjs-dialog-overlay] { display: none !important; }',
  });

  /* The homepage has a client-side boot screen before <main> is mounted. */
  if (path === '/en') {
    await expect(page.getByRole('status')).toHaveCount(0, {
      timeout: 10_000,
    });
  }

  const main = page.locator('main');

  await expect(main).toBeAttached();
  await expect(main).toBeVisible();

  if (path === '/en') {
    await expect(page.locator('.hero-eyebrow')).toContainText(
      'Full-Stack Developer',
    );

    await expect(page.locator('.hero-description')).toContainText(
      'production.',
    );
  }

  await page.evaluate(async () => {
    await document.fonts?.ready;
  });

  await waitForVisibleImages(page);
  await waitForPageEntry(page);

  await page.evaluate(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });

  });
}

export async function prepareFullPageVisual(page: Page) {
  /*
   * Trigger lazy-loaded Next/Image content throughout the document before
   * taking a fullPage screenshot.
   *
   * Scrolling in viewport-sized steps is considerably faster and more stable
   * than calling scrollIntoView() for every single image.
   */
  await page.evaluate(async () => {
    await document.fonts?.ready;

    const root =
      document.scrollingElement ??
      document.documentElement;

    const nextFrame = () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => resolve());
        });
      });

    const step = Math.max(
      Math.floor(window.innerHeight * 0.8),
      400,
    );

    let y = 0;

    while (y < root.scrollHeight) {
      window.scrollTo({
        top: y,
        left: 0,
        behavior: 'instant',
      });

      await nextFrame();

      y += step;
    }

    window.scrollTo({
      top: root.scrollHeight,
      left: 0,
      behavior: 'instant',
    });

    await nextFrame();

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });

    await nextFrame();
  });

  await expect
    .poll(
      () =>
        page.locator('img').evaluateAll((images) =>
          images
            .filter((image) => {
              const rect = image.getBoundingClientRect();

              return rect.width > 0 && rect.height > 0;
            })
            .filter(
              (image) => {
                const imageElement = image as HTMLImageElement;

                return (
                  !imageElement.complete ||
                  imageElement.naturalWidth === 0 ||
                  imageElement.naturalHeight === 0
                );
              },
            )
            .map((image) => {
              const imageElement = image as HTMLImageElement;

              return imageElement.currentSrc || imageElement.src;
            }),
        ),
      {
        message: 'full-page images should finish loading',
      },
    )
    .toEqual([]);

  await page.evaluate(() => {
    for (const animation of document.getAnimations()) {
      const iterations = animation.effect?.getComputedTiming().iterations;

      if (iterations !== Infinity) {
        try {
          animation.finish();
        } catch {
          // An animation can be cancelled while the page is settling.
        }
      }
    }
  });
}

export async function stabilizeVisualLayers(page: Page) {
  await page.mouse.move(0, 0);

  await page.evaluate(() => {
    for (const video of document.querySelectorAll('video')) {
      video.pause();

      try {
        video.currentTime = 0;
      } catch {
        // Some browsers/media states do not allow seeking yet.
      }
    }

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });
  });

  await page.addStyleTag({
    content: `
      html {
        scroll-behavior: auto !important;
      }

      canvas {
        visibility: hidden !important;
      }

      *,
      *::before,
      *::after {
        caret-color: transparent !important;
      }
    `,
  });
}

export async function settleAccessibility(page: Page) {
  await page.addStyleTag({
    content: `
      *,
      *::before,
      *::after {
        animation: none !important;
        transition: none !important;
      }

      [style*="opacity"],
      [style*="filter"] {
        opacity: 1 !important;
        filter: none !important;
      }
    `,
  });
}

export async function expectNoHorizontalOverflow(page: Page) {
  await expect
    .poll(
      () =>
        page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth,
        ),
      {
        message:
          'document should not exceed the horizontal viewport',
      },
    )
    .toBe(true);
}

export function collectRuntimeErrors(page: Page) {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  const knownDevelopmentWarnings = [
    'Encountered a script tag while rendering React component.',
  ];

  page.on('console', (message) => {
    if (message.type() !== 'error') {
      return;
    }

    const text = message.text();

    if (
      knownDevelopmentWarnings.some((warning) =>
        text.startsWith(warning),
      )
    ) {
      return;
    }

    consoleErrors.push(text);
  });

  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });

  return {
    consoleErrors,
    pageErrors,
  };
}

export const maskedVisualOptions = (page: Page) => ({
  animations: 'disabled' as const,
  caret: 'hide' as const,
  scale: 'css' as const,

  mask: [
    page.locator('img[src$=".gif"]'),
    page.locator('video'),
    page.locator('.metrics-ticker-wrapper'),
  ],

  maskColor: '#000000',
});
