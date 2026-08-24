import '@testing-library/jest-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
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

  it('renders video, slideshow, fallback image, stacks, and fallback metadata', async () => {
    const richRepos = [
      {
        ...mockRepos[0],
        id: 2,
        name: 'video-repo',
        description: null,
        language: 'Unknown',
        homepage: null,
        previewImage: '/demo.mp4',
        isVideo: true,
        topics: ['one', 'two', 'three', 'four'],
        techStack: ['React', 'Next.js'],
      },
      {
        ...mockRepos[0],
        id: 3,
        name: 'slideshow-repo',
        previewImage: JSON.stringify(['/one.png', '/two.png']),
        homepage: null,
      },
      {
        ...mockRepos[0],
        id: 4,
        name: 'plain-repo',
        description: 'plain preview',
        language: null,
        homepage: null,
        previewImage: '/plain.png',
        topics: [],
      },
      {
        ...mockRepos[0],
        id: 5,
        name: 'invalid-links',
        html_url: 'javascript:bad',
        homepage: 'javascript:bad',
        previewImage: '/invalid.png',
        topics: [],
      },
    ];
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => richRepos,
    });

    render(<GitHubProjects />);

    await waitFor(() => {
      expect(screen.getByText('video-repo')).toBeInTheDocument();
      expect(screen.getByText('slideshow-repo')).toBeInTheDocument();
      expect(screen.getByText('plain-repo')).toBeInTheDocument();
    });
    expect(document.querySelector('video')).toHaveAttribute('src', '/demo.mp4');
    expect(screen.getByText('No description available')).toBeInTheDocument();
    expect(screen.getByText('Tech Stack')).toBeInTheDocument();
    fireEvent.error(screen.getByAltText('plain-repo preview'));
    fireEvent.error(screen.getByAltText('invalid-links preview'));
    expect(screen.getAllByRole('link', { name: /Code/i }).at(-1)).toHaveAttribute('href', '#');
    expect(screen.queryByRole('link', { name: /Demo/i })).not.toBeInTheDocument();
  });

  it('covers slideshow timer and non-Error fetch failures', async () => {
    jest.useFakeTimers();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [{ ...mockRepos[0], previewImage: JSON.stringify(['/one.png', '/two.png']) }],
    });
    render(<GitHubProjects />);
    await waitFor(() => expect(screen.getByText('test-repo')).toBeInTheDocument());
    act(() => jest.advanceTimersByTime(3000));
    jest.useRealTimers();

    (global.fetch as jest.Mock).mockRejectedValueOnce('offline');
    render(<GitHubProjects />);
    await waitFor(() => expect(screen.getByText('Error: Unknown error')).toBeInTheDocument());
  });

  it('covers retry response parsing failure', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('first'));
    render(<GitHubProjects />);
    await waitFor(() => expect(screen.getByText('Retry')).toBeInTheDocument());
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, json: async () => { throw new Error('bad json'); } });
    fireEvent.click(screen.getByText('Retry'));
    await waitFor(() => expect(screen.getByText('Error: Failed to fetch repositories')).toBeInTheDocument());
  });

  it('covers non-Error retry failure and empty API error fallback', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('first'));
    render(<GitHubProjects />);
    await waitFor(() => expect(screen.getByText('Retry')).toBeInTheDocument());
    (global.fetch as jest.Mock).mockRejectedValueOnce('offline');
    fireEvent.click(screen.getByText('Retry'));
    await waitFor(() => expect(screen.getByText('Error: Unknown error')).toBeInTheDocument());

    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, json: async () => ({}) });
    render(<GitHubProjects />);
    await waitFor(() => expect(screen.getByText('Error: Failed to fetch repositories')).toBeInTheDocument());
  });
});
