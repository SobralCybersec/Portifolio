import { render, screen } from '@testing-library/react';
import Skills from '../Skills';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

jest.mock('../SectionHeader', () => {
  return function SectionHeader({ title }: { title: string }) {
    return <div>{title}</div>;
  };
});

describe('Skills Component', () => {
  it('renders section header', () => {
    render(<Skills />);
    expect(screen.getByText('SKILLS')).toBeInTheDocument();
  });

  it('displays all skill categories', () => {
    render(<Skills />);
    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('Backend')).toBeInTheDocument();
    expect(screen.getByText('Architecture')).toBeInTheDocument();
    expect(screen.getByText('DevOps')).toBeInTheDocument();
  });

  it('displays frontend skills', () => {
    render(<Skills />);
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Next.js')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Tailwind CSS')).toBeInTheDocument();
  });

  it('displays backend skills', () => {
    render(<Skills />);
    expect(screen.getByText('Node.js')).toBeInTheDocument();
    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.getByText('Go')).toBeInTheDocument();
    expect(screen.getByText('PostgreSQL')).toBeInTheDocument();
  });

  it('displays motivational quote', () => {
    render(<Skills />);
    expect(screen.getByText(/"Bringing Delusion into Reality."/i)).toBeInTheDocument();
  });
});
