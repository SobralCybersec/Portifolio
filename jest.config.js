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
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
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
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/components/__tests__/setup.ts',
  ],
};

module.exports = async () => ({
  ...(await createJestConfig(customJestConfig)()),
  transformIgnorePatterns: [
    'node_modules/(?!(next-intl|use-intl|@formatjs)/)',
  ],
});
