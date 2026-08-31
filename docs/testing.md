# Frontend QA

## Stack

- Jest remains runner for existing repository tests.
- Vitest + React Testing Library cover focused component behavior.
- Vitest Browser Mode runs one component check in real Chromium.
- Playwright covers real-browser smoke, navigation, responsive checks, accessibility, and visual snapshots.
- Storybook + `@storybook/addon-a11y` expose important component states for manual inspection and axe checks.
- Lighthouse CI runs locally against the built application and writes reports to `.lighthouseci/`.

## Commands

```text
pnpm test                         # Jest + Vitest + Browser Mode + Playwright
pnpm run test:jest                # existing Jest suite
pnpm run test:vitest              # jsdom component tests
pnpm run test:browser             # Vitest Browser Mode / Chromium
pnpm run test:playwright          # all configured Playwright projects
pnpm run test:e2e                 # smoke, navigation, responsive
pnpm run test:accessibility       # axe checks in Chromium
pnpm run test:visual              # consciously regenerate visual baselines
pnpm run test:lighthouse          # build, local Lighthouse CI, filesystem reports
pnpm run storybook                # Storybook development server
pnpm run build-storybook          # reproducible Storybook build
```

`pnpm run test:visual` is the only snapshot-update command. Normal `pnpm test` never updates baselines.

## Visual workflow

Baselines live beside `tests/visual/pages.visual.spec.ts` in its Playwright snapshot directory. They cover `/en` desktop/mobile, `/en/about`, `/en/projects`, `/en/certifications`, `/en/contact`, the navigation region, and a project-card region.

1. Run `pnpm test` first.
2. Inspect the Playwright diff and determine whether the change is intentional.
3. Fix the frontend when the diff is a regression.
4. Only after visual review, run `pnpm run test:visual` to approve a deliberate change.

Screenshots wait for fonts and visible images, and mask only dynamic canvas/GIF/video layers. The projects canvas host is masked as one localized region; `tests/e2e/canvas.spec.ts` checks attachment and non-zero dimensions, while smoke tests catch runtime errors. Generate and compare snapshots on the same OS, browser versions, and font set.

Open report with `pnpm exec playwright show-report`. Open a trace with `pnpm exec playwright show-trace test-results/<trace>.zip`.

## Adding coverage

- Add user-observable behavior to `tests/e2e/`.
- Add page or region snapshots to `tests/visual/` only for stable states.
- Add axe coverage to `tests/accessibility/` without broad exclusions.
- Add focused React behavior to `tests/vitest/`.
- Add browser-only DOM or screenshot behavior to `tests/browser/`.
- Add only meaningful component states to `tests/stories/`.

API responses and external badge scripts are intercepted in browser tests so screenshots do not depend on remote data. The application components and CSS remain unchanged.
