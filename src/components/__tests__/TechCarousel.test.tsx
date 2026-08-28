import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
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

  it('renders compact signal items with the same detail modal', () => {
    const { container } = render(<TechCarousel compact />);

    expect(container.querySelector('.carousel-wrapper')).not.toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Inspect TypeScript' })[0]);

    expect(screen.getByText('Key Features')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Learn More' })).toHaveAttribute('href', 'https://www.typescriptlang.org/');
  });

  it('opens and closes the detail modal', () => {
    const { container } = render(<TechCarousel />);
    fireEvent.click(container.querySelector('.tech-card-wrapper')!);
    expect(screen.getByText('Key Features')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Learn More' })).toHaveAttribute('href', 'https://www.typescriptlang.org/');
    const modal = screen.getByText('Key Features').closest('.fixed')!;
    fireEvent.click(modal.querySelector(':scope > div')!);
    fireEvent.click(modal);
    fireEvent.click(Array.from(container.querySelectorAll('.tech-card-wrapper')).at(-1)!);
    expect(screen.getByText('Key Features')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close technology details' }));
    expect(screen.queryByText('Key Features')).not.toBeInTheDocument();
  });
});
