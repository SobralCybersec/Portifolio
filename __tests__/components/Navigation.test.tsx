import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import Navigation from '@/components/Navigation';

const messages = {
  nav: {
    home: 'Home',
    about: 'ABOUT',
    projects: 'PROJECTS',
    certifications: 'CERTIFICATIONS',
    blog: 'BLOG',
    contact: 'CONTACT',
    github: 'GITHUB',
  },
};

describe('Navigation Component', () => {
  it('renders navigation links', () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <Navigation />
      </NextIntlClientProvider>
    );

    expect(screen.getByText('ABOUT')).toBeInTheDocument();
    expect(screen.getByText('PROJECTS')).toBeInTheDocument();
    expect(screen.getByText('BLOG')).toBeInTheDocument();
  });

  it('renders theme toggle button', () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <Navigation />
      </NextIntlClientProvider>
    );

    const themeButton = screen.getByRole('button', { name: /theme/i });
    expect(themeButton).toBeInTheDocument();
  });

  it('renders language selector', () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <Navigation />
      </NextIntlClientProvider>
    );

    const languageButton = screen.getByRole('button', { name: /language/i });
    expect(languageButton).toBeInTheDocument();
  });
});
