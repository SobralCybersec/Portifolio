import { defineConfig, globalIgnores } from 'eslint/config';
import { fixupConfigRules } from '@eslint/compat';
import tsParser from '@typescript-eslint/parser';
import nextVitals from 'eslint-config-next/core-web-vitals';

const eslintConfig = defineConfig([
  ...fixupConfigRules(nextVitals),
  {
    files: ['**/*.{js,jsx,mjs,ts,tsx,mts,cts}'],
    languageOptions: { parser: tsParser },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'coverage/**',
    '.swc/**',
    'playwright-report/**',
    'test-results/**',
    '.lighthouseci/**',
    'storybook-static/**',
  ]),
]);

export default eslintConfig;
