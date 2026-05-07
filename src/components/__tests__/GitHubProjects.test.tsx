import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GitHubProjects from '../GitHubProjects';

global.fetch = jest.fn();

describe('GitHubProjects', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockRepos = [
    {
      id: 1,
      name: 'test-repo',
      description: 'Test repository',
      html_url: 'https://github.com/SobralCybersec/test-repo',
      stargazers_count: 10,
      forks_count: 5,
      language: 'TypeScript',
      topics: ['react', 'nextjs'],
      homepage: 'https://test.com',
      owner: { login: 'SobralCybersec' },
    },
  ];

  it('renders section with correct heading', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockRepos,
    });

    render(<GitHubProjects />);

    await waitFor(() => {
      expect(screen.getByText('My Projects')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<GitHubProjects />);

    expect(screen.getByText('My Projects')).toBeInTheDocument();
  });

  it('fetches and displays repositories', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockRepos,
    });

    render(<GitHubProjects />);

    await waitFor(() => {
      expect(screen.getByText('test-repo')).toBeInTheDocument();
      expect(screen.getByText('Test repository')).toBeInTheDocument();
    });
  });

  it('handles API error gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    render(<GitHubProjects />);

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });

  it('handles rate limit error', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({
        error: 'GitHub API rate limit exceeded. Please try again later.',
      }),
    });

    render(<GitHubProjects />);

    await waitFor(() => {
      expect(screen.getByText(/GitHub API rate limit exceeded/i)).toBeInTheDocument();
    });
  });

  it('retries fetch when retry button clicked', async () => {
    (global.fetch as jest.Mock)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockRepos,
      });

    render(<GitHubProjects />);

    await waitFor(() => {
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    const retryButton = screen.getByText('Retry');
    await userEvent.click(retryButton);

    await waitFor(() => {
      expect(screen.getByText('test-repo')).toBeInTheDocument();
    });
  });

  it('displays repository stats', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockRepos,
    });

    render(<GitHubProjects />);

    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
    });
  });

  it('displays topics', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockRepos,
    });

    render(<GitHubProjects />);

    await waitFor(() => {
      expect(screen.getByText('react')).toBeInTheDocument();
      expect(screen.getByText('nextjs')).toBeInTheDocument();
    });
  });

  it('renders GitHub link', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockRepos,
    });

    render(<GitHubProjects />);

    await waitFor(() => {
      const links = screen.getAllByRole('link', { name: /Code/i });
      expect(links[0]).toHaveAttribute('href', 'https://github.com/SobralCybersec/test-repo');
    });
  });

  it('renders demo link when homepage exists', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockRepos,
    });

    render(<GitHubProjects />);

    await waitFor(() => {
      const demoLink = screen.getByRole('link', { name: /Demo/i });
      expect(demoLink).toHaveAttribute('href', 'https://test.com');
    });
  });
});
