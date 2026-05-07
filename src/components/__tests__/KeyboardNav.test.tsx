import { render, screen, fireEvent } from '@testing-library/react';
import KeyboardNav from '../KeyboardNav';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('KeyboardNav Component', () => {
  it('renders navigation buttons', () => {
    render(<KeyboardNav />);
    expect(screen.getByLabelText('Scroll up')).toBeInTheDocument();
    expect(screen.getByLabelText('Scroll down')).toBeInTheDocument();
    expect(screen.getByLabelText('Toggle menu')).toBeInTheDocument();
  });

  it('calls onMenuToggle when menu button is clicked', () => {
    const mockToggle = jest.fn();
    render(<KeyboardNav onMenuToggle={mockToggle} />);
    
    const menuButton = screen.getByLabelText('Toggle menu');
    fireEvent.click(menuButton);
    
    expect(mockToggle).toHaveBeenCalledTimes(1);
  });

  it('handles scroll up button click', () => {
    const scrollToSpy = jest.spyOn(window, 'scrollTo').mockImplementation();
    render(<KeyboardNav />);
    
    const upButton = screen.getByLabelText('Scroll up');
    fireEvent.click(upButton);
    
    expect(scrollToSpy).toHaveBeenCalled();
    scrollToSpy.mockRestore();
  });

  it('handles scroll down button click', () => {
    const scrollToSpy = jest.spyOn(window, 'scrollTo').mockImplementation();
    render(<KeyboardNav />);
    
    const downButton = screen.getByLabelText('Scroll down');
    fireEvent.click(downButton);
    
    expect(scrollToSpy).toHaveBeenCalled();
    scrollToSpy.mockRestore();
  });
});
