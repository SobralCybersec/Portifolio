import { render, screen } from '@testing-library/react';
import TechCarousel from '../TechCarousel';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('TechCarousel Component', () => {
  it('renders tech stack items', () => {
    render(<TechCarousel />);
    expect(screen.getAllByText('TypeScript')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Next.js')[0]).toBeInTheDocument();
    expect(screen.getAllByText('React')[0]).toBeInTheDocument();
  });

  it('renders multiple instances for carousel effect', () => {
    render(<TechCarousel />);
    const typeScriptItems = screen.getAllByText('TypeScript');
    expect(typeScriptItems.length).toBeGreaterThan(1);
  });

  it('renders all tech stack items', () => {
    render(<TechCarousel />);
    expect(screen.getAllByText('Java')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Python')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Docker')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Kafka')[0]).toBeInTheDocument();
  });
});
