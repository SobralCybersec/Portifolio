import {
  cloudFrontLoader,
  cloudflareLoader,
  cloudinaryLoader,
  imgixLoader,
} from '@/lib/media/image-loader';
import { getSupportedLocales, translateText } from '@/lib/localization/translate';
import { getLanguageImage } from '@/lib/github/languageIcon';
import { safeExternalUrl, safeGithubUrl } from '@/lib/security/url';

describe('image loaders', () => {
  test('builds CDN URLs with explicit and default quality', () => {
    process.env.NEXT_PUBLIC_CDN_URL = 'https://cdn.example';
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = 'demo';
    process.env.NEXT_PUBLIC_IMGIX_DOMAIN = 'images.example';
    expect(cloudflareLoader({ src: '/a.png', width: 400, quality: 90 })).toContain('width=400,quality=90');
    expect(cloudflareLoader({ src: '/a.png', width: 400 })).toContain('quality=75');
    expect(cloudFrontLoader({ src: '/a.png', width: 400, quality: 60 })).toBe('https://cdn.example/a.png?w=400&q=60');
    expect(cloudFrontLoader({ src: '/a.png', width: 400 })).toContain('q=80');
    expect(cloudinaryLoader({ src: 'a.png', width: 400, quality: 70 })).toContain('/demo/image/upload/f_auto,c_limit,w_400,q_70/a.png');
    expect(cloudinaryLoader({ src: 'a.png', width: 400 })).toContain('q_auto');
    expect(imgixLoader({ src: '/a.png', width: 400, quality: 80 })).toContain('auto=format%2Ccompress&w=400&q=80');
    expect(imgixLoader({ src: '/a.png', width: 400 })).toContain('q=75');
    delete process.env.NEXT_PUBLIC_CDN_URL;
    expect(cloudFrontLoader({ src: '/a.png', width: 400 })).toBe('/a.png?w=400&q=80');
    delete process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    delete process.env.NEXT_PUBLIC_IMGIX_DOMAIN;
  });
});

describe('safe URL and language helpers', () => {
  test('accepts allowlisted URLs and falls back for unsafe values', () => {
    expect(safeGithubUrl('https://github.com/example/repo')).toBe('https://github.com/example/repo');
    expect(safeGithubUrl(undefined)).toBeNull();
    expect(safeGithubUrl('http://github.com/example/repo')).toBeNull();
    expect(safeGithubUrl('https://evil.example/repo')).toBeNull();
    expect(safeGithubUrl('not-a-url')).toBeNull();
    expect(safeExternalUrl('https://example.test/demo')).toBe('https://example.test/demo');
    expect(safeExternalUrl(null)).toBeNull();
    expect(safeExternalUrl('javascript:alert(1)')).toBeNull();
    expect(safeExternalUrl('not-a-url')).toBeNull();
  });

  test('maps known languages and unknown or empty values to the GitHub icon', () => {
    expect(getLanguageImage(' TypeScript ')).toBe('/icons/typescript.png');
    expect(getLanguageImage('Unknown')).toBe('/icons/github.png');
    expect(getLanguageImage(null)).toBe('/icons/github.png');
  });
});

describe('translation fallbacks', () => {
  beforeEach(() => {
    delete process.env.GROQ_API_KEY;
    jest.restoreAllMocks();
  });

  test('handles identity, empty text, supported locales, and MyMemory success', async () => {
    expect(await translateText('same', 'en')).toBe('same');
    expect(await translateText('  ', 'pt')).toBe('  ');
    expect(getSupportedLocales()).toEqual(['en', 'es', 'pt', 'fr', 'de', 'ja', 'zh']);
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ responseStatus: 200, responseData: { translatedText: 'Olá' } }),
    });
    expect(await translateText('Hello', 'pt')).toBe('Olá');
  });

  test('returns original text for MyMemory errors and malformed responses', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({ ok: false, status: 503, statusText: 'down' });
    expect(await translateText('Hello', 'xx')).toBe('Hello');
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({ responseStatus: 500 }) });
    expect(await translateText('Hello', 'pt')).toBe('Hello');
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('network'));
    expect(await translateText('Hello', 'pt')).toBe('Hello');
  });

  test('uses Groq response cleanup and MyMemory fallback', async () => {
    process.env.GROQ_API_KEY = 'key';
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ choices: [{ message: { content: 'Translation: ```\nAlternatively: Better result.\n```' } }] }),
    });
    expect(await translateText('Hello', 'pt', 'en')).toBe('Better result');

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ choices: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ responseStatus: 200, responseData: { translatedText: 'Fallback' } }) });
    expect(await translateText('Hello', 'pt')).toBe('Fallback');

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: false, status: 500 })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ responseStatus: 200, responseData: { translatedText: 'Fallback 2' } }) });
    expect(await translateText('Hello', 'pt')).toBe('Fallback 2');
  });

  test('retries Groq rate limits, resolves unknown language names, and catches failures', async () => {
    jest.useFakeTimers();
    jest.spyOn(Math, 'random').mockReturnValue(0);
    process.env.GROQ_API_KEY = 'key';
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ status: 429 })
      .mockResolvedValueOnce({ status: 429 })
      .mockResolvedValueOnce({ status: 429 })
      .mockResolvedValueOnce({ status: 429 })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ responseStatus: 200, responseData: { translatedText: 'retry fallback' } }) });
    const retry = translateText('Hello', 'xx', 'en');
    await jest.runAllTimersAsync();
    await expect(retry).resolves.toBe('retry fallback');

    (global.fetch as jest.Mock)
      .mockRejectedValueOnce(new Error('Groq down'))
      .mockResolvedValueOnce({ ok: true, json: async () => ({ responseStatus: 200, responseData: { translatedText: 'caught fallback' } }) });
    await expect(translateText('Hello', 'xx', 'en')).resolves.toBe('caught fallback');
    jest.useRealTimers();
  });
});
