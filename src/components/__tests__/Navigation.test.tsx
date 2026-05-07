import { render, screen } from '@testing-library/react';
import Navigation from '../Navigation';

describe('Navigation', () => {
  it('renders logo link', () => {
    render(<Navigation />);
    expect(screen.getByText('LO')).toBeInTheDocument();
  });

  it('renders blog link', () => {
    render(<Navigation />);
    expect(screen.getByText('BLOG')).toBeInTheDocument();
  });

  it('has correct href attributes', () => {
    render(<Navigation />);
    const logoLink = screen.getByText('LO').closest('a');
    const blogLink = screen.getByText('BLOG').closest('a');
    
    expect(logoLink).toHaveAttribute('href', '/');
    expect(blogLink).toHaveAttribute('href', '/blog');
  });
});
