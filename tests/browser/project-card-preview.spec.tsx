import { render } from '@testing-library/react';
import { page } from 'vitest/browser';
import { expect, test, vi } from 'vitest';
import { ProjectCardPreview } from '@/components/projects/ProjectCardParts';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/components/ui/SafeImage', () => ({
  default: ({ alt, src }: { alt: string; src: string }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} />;
  },
}));

vi.mock('@/components/projects/ImageSlideshow', () => ({
  default: ({ alt }: { alt: string }) => <div role="img" aria-label={alt}>slideshow</div>,
}));

test('renders project preview in real Chromium browser', async () => {
  const colors = {
    bg: '#080012',
    panel: '#0e001e',
    panel2: '#14002a',
    primary: '#a855f7',
    primaryBright: '#d8b4fe',
    primaryDark: '#7e22ce',
    white: '#ffffff',
    muted: '#c4b5fd',
    border: '#a855f766',
    glow: '#7e22ce',
  };

  render(
    <div data-testid="preview-shell" style={{ width: 360 }}>
      <ProjectCardPreview
        repo={{
          id: 101,
          name: 'qa-showcase',
          description: 'Stable fixture',
          html_url: 'https://github.com/example/qa-showcase',
          homepage: null,
          language: 'TypeScript',
          stargazers_count: 1,
          forks_count: 0,
          topics: [],
        }}
        previewImages={['/icons/typescript.png']}
        languageFallback="/icons/typescript.png"
        colors={colors}
        isLight={false}
        shouldReduceMotion
        isLanguageIcon
        featured={false}
      />
    </div>,
  );

  await expect.element(page.getByRole('img', { name: 'TypeScript' })).toBeVisible();
  await expect.element(page.getByTestId('preview-shell')).toMatchScreenshot('project-card-preview.png');
});
