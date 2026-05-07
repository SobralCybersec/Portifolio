import { render, screen } from '@testing-library/react';
import Hero from '../Hero';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

describe('Hero Component', () => {
  it('renders hero title with name', () => {
    render(<Hero />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(/I'M.*LO/i);
  });

  it('displays job title', () => {
    render(<Hero />);
    expect(screen.getByText(/CREATIVE TECHNOLOGIST/i)).toBeInTheDocument();
  });

  it('shows rank stat', () => {
    render(<Hero />);
    expect(screen.getByText(/RANK/i)).toBeInTheDocument();
    expect(screen.getByText(/^S$/)).toBeInTheDocument();
  });

  it('shows projects stat', () => {
    render(<Hero />);
    expect(screen.getByText(/PROJECTS/i)).toBeInTheDocument();
    expect(screen.getByText(/50\+/)).toBeInTheDocument();
  });

  it('shows experience stat', () => {
    render(<Hero />);
    expect(screen.getByText(/EXPERIENCE/i)).toBeInTheDocument();
    expect(screen.getByText(/5Y/)).toBeInTheDocument();
  });

  it('displays description text', () => {
    render(<Hero />);
    expect(screen.getByText(/Full-stack developer/i)).toBeInTheDocument();
    expect(screen.getByText(/Building scalable applications/i)).toBeInTheDocument();
  });

  it('renders hero image', () => {
    render(<Hero />);
    const image = screen.getByAltText('Sung Jin Woo');
    expect(image).toBeInTheDocument();
  });
});
