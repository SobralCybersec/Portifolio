import { NextIntlClientProvider } from 'next-intl';
import { ThemeProvider } from 'next-themes';
import type { Preview } from '@storybook/nextjs';
import messages from '../src/i18n/messages/en.json';
import '../src/app/globals.css';

const preview: Preview = {
  parameters: {
    a11y: {
      test: 'todo',
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="en" messages={messages}>
        <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false}>
          <div style={{ minHeight: '100vh', padding: '2rem', background: '#030008' }}>
            <Story />
          </div>
        </ThemeProvider>
      </NextIntlClientProvider>
    ),
  ],
};

export default preview;
