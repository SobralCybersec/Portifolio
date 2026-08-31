module.exports = {
  ci: {
    collect: {
      startServerCommand: 'pnpm start',
      url: [
        'http://localhost:3000/en',
        'http://localhost:3000/en/about',
        'http://localhost:3000/en/projects',
      ],
      numberOfRuns: 1,
    },
    upload: {
      target: 'filesystem',
      outputDir: '.lighthouseci',
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'interactive': ['warn', { maxNumericValue: 3500 }],
      },
    },
  },
};
