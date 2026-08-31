import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ContactCommandForm from '@/components/contact/ContactCommandForm';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/components/contact/ClickSpark', () => ({
  default: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/ui/MagneticButton', () => ({
  default: ({ children, type = 'button', disabled = false }: { children: ReactNode; type?: 'button' | 'submit' | 'reset'; disabled?: boolean }) => (
    <button type={type} disabled={disabled}>{children}</button>
  ),
}));

const copy = {
  validationError: 'Complete the form.',
  draftReady: 'Mail draft ready.',
  openMailChannel: 'Open mail channel',
  draftReadyButton: 'Draft ready',
};

function renderForm() {
  return render(
    <ContactCommandForm
      title="Get in touch"
      description="Send a project brief."
      emailAddress="hello@example.test"
      emailLabel="Email"
      links={[]}
      copy={copy}
    />,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ContactCommandForm', () => {
  it('exposes labeled fields and reports invalid form state', async () => {
    renderForm();
    const form = screen.getByPlaceholderText('What are you building?').closest('form');
    expect(form).not.toBeNull();

    fireEvent.submit(form!);

    expect(await screen.findByText('Complete the form.')).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'IDENTITY' })).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('textbox', { name: 'EMAIL' })).toHaveAttribute('aria-label', 'EMAIL');
    expect(screen.getByRole('textbox', { name: 'PROJECT BRIEF' })).toBeRequired();
  });

  it('creates a mail draft after a valid user submission', async () => {
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { href: 'http://localhost/' },
    });

    try {
      const user = userEvent.setup();
      renderForm();
      await user.type(screen.getByRole('textbox', { name: 'IDENTITY' }), 'Ada');
      await user.type(screen.getByRole('textbox', { name: 'EMAIL' }), 'ada@example.com');
      await user.type(screen.getByRole('textbox', { name: 'PROJECT BRIEF' }), 'A browser QA suite');
      await user.click(screen.getByRole('button', { name: 'Open mail channel' }));

      expect(await screen.findByText('Mail draft ready.')).toBeVisible();
      expect(window.location.href).toContain('mailto:hello@example.test');
      expect(screen.getByRole('button', { name: 'Draft ready' })).toBeDisabled();
    } finally {
      Object.defineProperty(window, 'location', { configurable: true, value: originalLocation });
    }
  });
});
