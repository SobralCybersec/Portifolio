import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import Navigation from '../Navigation';

describe('Navigation', () => {
  it('renders without crashing', () => {
    const { container } = render(<Navigation />);
    expect(container).toBeTruthy();
  });

  it('opens mobile menu, handles hover, and closes after navigation', () => {
    render(<Navigation />);
    const projects = screen.getAllByRole('link', { name: 'projects' })[0];
    fireEvent.mouseEnter(projects);
    fireEvent.mouseLeave(projects);
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    expect(screen.getByRole('button', { name: 'Close menu' })).toBeInTheDocument();
    const mobileProjects = screen.getAllByRole('link', { name: 'projects' }).at(-1)!;
    fireEvent.click(mobileProjects);
    expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument();
  });

  it('covers light palette, active links, and hover overlay', () => {
    const themes = jest.requireMock('next-themes') as { useTheme: jest.Mock };
    const routing = jest.requireMock('@/i18n/routing') as { useTheme?: jest.Mock; usePathname: jest.Mock };
    jest.spyOn(themes, 'useTheme').mockReturnValue({ resolvedTheme: 'light', theme: 'light', setTheme: jest.fn() });
    jest.spyOn(routing, 'usePathname').mockReturnValue('/projects/detail');
    render(<Navigation />);
    const about = screen.getAllByRole('link', { name: 'about' })[0];
    fireEvent.mouseEnter(about);
    expect(about.querySelector('span')).toBeInTheDocument();
    fireEvent.mouseLeave(about);
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    expect(screen.getByRole('button', { name: 'Close menu' })).toBeInTheDocument();
  });
});
