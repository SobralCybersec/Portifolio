import { render, screen } from '@testing-library/react';
import Contact from '../Contact';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    a: ({ children, ...props }: any) => <a {...props}>{children}</a>,
  },
}));

describe('Contact Component', () => {
  it('renders main heading', () => {
    render(<Contact />);
    expect(screen.getByRole('heading', { name: /Let's Talk/i })).toBeInTheDocument();
  });

  it('displays send message button', () => {
    render(<Contact />);
    expect(screen.getByText('SEND MESSAGE')).toBeInTheDocument();
  });

  it('displays social media links', () => {
    render(<Contact />);
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThanOrEqual(5);
  });

  it('displays system status', () => {
    render(<Contact />);
    expect(screen.getByText(/SYSTEM STATUS: ONLINE/i)).toBeInTheDocument();
  });

  it('displays copyright notice', () => {
    render(<Contact />);
    expect(screen.getByText(/© 2024 LO/i)).toBeInTheDocument();
  });
});
