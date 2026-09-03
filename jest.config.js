const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    'next/font/(.*)': '<rootDir>/test-mocks/next-font-google.js',
    '^next/font/google$': '<rootDir>/test-mocks/next-font-google.js',
    '^next/font/local$': '<rootDir>/test-mocks/next-font-local.js',
  },
  testMatch: ['**/tests/**/*.test.[jt]s?(x)'],
  modulePathIgnorePatterns: ['<rootDir>/.next/'],
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'reports',
      outputName: 'junit.xml',
    }],
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov', 'json-summary'],
  coverageThreshold: {
    global: { lines: 90 },
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{js,jsx,ts,tsx}',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    // Next route entrypoints are covered by the browser/build checks.
    '!src/app/**/blog/**',
    // Canvas/GSAP visual effects are covered by browser and visual tests.
    '!src/components/about/AboutParticleField.tsx',
    '!src/components/about/AboutScrollStory.tsx',
    '!src/components/projects/MagneticLibraryGrid.tsx',
    '!src/components/tests/setup.ts',
  ],
};

module.exports = async () => ({
  ...(await createJestConfig(customJestConfig)()),
  transformIgnorePatterns: [
    'node_modules/(?!(next-intl|use-intl|@formatjs)/)',
  ],
});
