module.exports = {
  ci: {
    collect: {
      startServerCommand: 'pnpm start',

      url: [
        'http://localhost:3000/en',
        'http://localhost:3000/en/about',
        'http://localhost:3000/en/projects',
        'http://localhost:3000/en/certifications',
        'http://localhost:3000/en/chat',
        'http://localhost:3000/en/contact',
      ],

      // Reduz variação entre execuções.
      numberOfRuns: 1,

      // Measure this local production server without synthetic throttling.
      settings: {
        throttlingMethod: 'provided',
        chromeFlags: '--force-prefers-reduced-motion',
      },

      // Dá margem para o Next.js subir corretamente.
      startServerReadyTimeout: 30000,
    },

    upload: {
      target: 'filesystem',
      outputDir: '.lighthouseci',
    },

    assert: {
      assertions: {
        /*
         * ============================================================
         * QUALITY GATES
         * Se falhar aqui, CI deve quebrar.
         * ============================================================
         */

        'categories:performance': [
          'error',
          {
            minScore: 0.9,
            aggregationMethod: 'median-run',
          },
        ],

        'categories:accessibility': [
          'error',
          {
            minScore: 0.95,
            aggregationMethod: 'median-run',
          },
        ],

        'categories:best-practices': [
          'error',
          {
            minScore: 0.95,
            aggregationMethod: 'median-run',
          },
        ],

        'categories:seo': [
          'error',
          {
            minScore: 0.95,
            aggregationMethod: 'median-run',
          },
        ],

        // Não aceito erros JS/runtime silenciosos.
        'errors-in-console': [
          'error',
          {
            minScore: 1,
            aggregationMethod: 'median-run',
          },
        ],

        // Layout não deve ficar "pulando".
        'cumulative-layout-shift': [
          'error',
          {
            maxNumericValue: 0.1,
            aggregationMethod: 'median-run',
          },
        ],

        /*
         * ============================================================
         * PERFORMANCE BUDGET
         * Inicialmente warning: queremos melhorar sem destruir o design.
         * ============================================================
         */

        'largest-contentful-paint': [
          'warn',
          {
            maxNumericValue: 2500,
            aggregationMethod: 'median-run',
          },
        ],

        'total-blocking-time': [
          'warn',
          {
            maxNumericValue: 300,
            aggregationMethod: 'median-run',
          },
        ],

        'first-contentful-paint': [
          'warn',
          {
            maxNumericValue: 1800,
            aggregationMethod: 'median-run',
          },
        ],

        'speed-index': [
          'warn',
          {
            maxNumericValue: 3400,
            aggregationMethod: 'median-run',
          },
        ],
      },
    },
  },
};
