import '@testing-library/jest-dom';
import 'jest-canvas-mock';
import { TextEncoder, TextDecoder } from 'util';


jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ fill, priority, quality, unoptimized, ...props }) => require('react').createElement('img', props),
}));

jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }) => require('react').createElement('div', null, children),
}));
jest.mock('remark-gfm', () => ({ __esModule: true, default: {} }));
jest.mock('rehype-raw', () => ({ __esModule: true, default: {} }));
jest.mock('rehype-sanitize', () => ({ __esModule: true, default: {} }));

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }),
  });
}

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
const testTranslations = {
  'nav.openMenu': 'Open menu',
  'nav.closeMenu': 'Close menu',
  'nav.selectLanguage': 'Select language',
  'nav.toggleTheme': 'Toggle theme',
  'projects.filters.allProjects': 'All Projects',
  'projects.filters.allTechnologies': 'All Technologies',
  'projects.filters.language': 'Language',
  'projects.filters.technology': 'Technology',
  'projects.filters.search': 'Search projects...',
  'projects.showing': 'Showing',
  'projects.of': 'of',
  'projects.projectUnit': 'projects',
  'projects.noResults': 'No projects found matching your criteria.',
  'projects.languageIcon': 'Language icon',
  'projects.archive': 'Archive',
  'projects.deploy': 'Deploy',
  'projects.imageNumber': 'Go to image {number}',
  'projects.inspectReadme': 'README',
  'projects.readme': 'README',
  'projects.readmeLoading': 'Loading README...',
  'projects.readmeEmpty': 'No README found for this repository.',
  'projects.readmeError': 'README could not be loaded.',
  'projects.closeReadme': 'Close README',
  'projects.openOnGithub': 'Open on GitHub',
  'certifications.filter': 'Filter',
  'certifications.noResults': 'No certifications found matching your criteria.',
  'certifications.type': 'Certification',
  'certifications.skillsCovered': 'Skills Covered',
  'certifications.viewCredential': 'View Credential',
  'certifications.closeDetails': 'Close certification details',
  'chat.title': 'Live Chat',
  'chat.signOut': 'Sign out',
  'chat.signInGithub': 'Sign in with GitHub',
  'chat.emptyState': 'No messages yet. Be the first to say something!',
  'chat.inputPlaceholder': 'Type a message... (Enter to send)',
  'chat.send': 'Send',
  'chat.joinConversation': 'to join the conversation',
  'liveCoding.feedEyebrow': 'LIVE / CODING FEED',
  'liveCoding.runtimeSignal': 'Runtime / Recorded Signal',
  'liveCoding.refresh': 'Refresh',
  'liveCoding.feedStatus': 'FEED STATUS',
  'liveCoding.signalInterrupted': 'Signal interrupted',
  'liveCoding.syncingFeed': 'Syncing feed',
  'liveCoding.signalOnline': 'Signal online',
  'liveCoding.sourceChannel': 'SOURCE CHANNEL',
  'liveCoding.lastTransmission': 'LAST TRANSMISSION',
  'liveCoding.snapshotSynced': 'Snapshot synced',
  'liveCoding.awaitingSnapshot': 'Awaiting next snapshot',
  'liveCoding.imageAlt': 'Live Coding Session',
  'liveCoding.readmeError': 'Failed to fetch README',
  'liveCoding.gifMissingError': 'GIF URL not found in README',
  'liveCoding.unknownError': 'Unknown error',
  'tech.inspect': 'Inspect',
  'tech.signalEyebrow': 'Live stack index',
  'tech.signalTitle': 'Follow the stack signal',
  'tech.capabilityMap': 'Capability map',
  'tech.closeDetails': 'Close technology details',
  'tech.category': 'Category',
  'tech.keyFeatures': 'Key Features',
  'tech.learnMore': 'Learn More',
};

jest.mock('next-intl', () => ({
  useTranslations: (namespace) => (key, values) => {
    const template = testTranslations[`${namespace}.${key}`] || key;
    return Object.entries(values || {}).reduce(
      (result, [name, value]) => result.replace(`{${name}}`, String(value)),
      template,
    );
  },
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
      return ({
        children,
        // Drop framer-motion-only props so React doesn't warn about unknown DOM attrs
        whileInView, whileHover, whileTap, whileFocus, whileDrag,
        initial, animate, exit, variants, transition, viewport,
        layout, layoutId, drag,
        ...rest
      }) => {
        return require('react').createElement(prop, rest, children);
      };
    },
  }),
  AnimatePresence: ({ children }) => children,
  useAnimation: () => ({
    start: jest.fn(),
    stop: jest.fn(),
  }),
  useMotionValue: (initial) => ({ get: () => initial, set: jest.fn() }),
  useTransform: (value, transform) => {
    const latest = typeof value?.get === 'function' ? value.get() : value;
    if (typeof transform === 'function') return transform(latest);
    return latest;
  },
  useMotionTemplate: (strings, ...values) => strings.reduce(
    (result, string, index) => `${result}${string}${values[index] ?? ''}`,
    '',
  ),
  useScroll: () => ({
    scrollY: { get: () => 0, set: jest.fn() },
    scrollYProgress: { get: () => 0, set: jest.fn() },
  }),
  useVelocity: (value) => value,
  useAnimationFrame: () => undefined,
  useSpring: (value) => value,
  useReducedMotion: () => false,
  animate: (_value, _target, _options) => ({ stop: jest.fn() }),
}));

// Mock next-intl routing
jest.mock('@/i18n/config/routing', () => ({
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
  constructor(callback) { this.callback = callback; }
  disconnect() {}
  observe(element) {
    if (element?.dataset?.lazyLoad) {
      this.callback?.([{ isIntersecting: true }]);
    }
  }
  takeRecords() { return []; }
  unobserve() {}
};
