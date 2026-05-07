import '@testing-library/jest-dom';
import 'jest-canvas-mock';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

global.Request = class Request {
  constructor(url) {
    this.url = url;
  }
};

global.Response = class Response {
  constructor(body, init) {
    this.body = body;
    this.init = init || {};
    this.status = this.init.status || 200;
    this.headers = new Map(Object.entries(this.init.headers || {}));
  }
  json() { return Promise.resolve(JSON.parse(this.body)); }
  static json(data, init) {
    return new Response(JSON.stringify(data), init);
  }
};

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key) => key,
  useLocale: () => 'en',
  useMessages: () => ({}),
}));

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'dark', setTheme: jest.fn() }),
  ThemeProvider: ({ children }) => children,
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/en',
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: (target, prop) => {
      return ({ children, ...props }) => {
        return require('react').createElement(prop, props, children);
      };
    },
  }),
  AnimatePresence: ({ children }) => children,
  useAnimation: () => ({
    start: jest.fn(),
    stop: jest.fn(),
  }),
  useMotionValue: (initial) => ({ get: () => initial, set: jest.fn() }),
  useTransform: () => ({ get: () => 0, set: jest.fn() }),
  useScroll: () => ({ scrollYProgress: { get: () => 0, set: jest.fn() } }),
}));

// Mock next-intl routing
jest.mock('@/i18n/routing', () => ({
  routing: {
    locales: ['en', 'pt', 'es', 'fr', 'de', 'ja', 'zh'],
    defaultLocale: 'en',
  },
  Link: ({ children, ...props }) => require('react').createElement('a', props, children),
  usePathname: () => '/en',
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() { return []; }
  unobserve() {}
};
