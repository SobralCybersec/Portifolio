import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LivePreview from '../LivePreview';

global.fetch = jest.fn();

describe('LivePreview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders section with correct heading', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      text: async () => '<img src="https://github.com/SobralCybersec/SobralCybersec/releases/download/2024-01-01.12-00-00/demo.gif" />',
    });

    render(<LivePreview />);

    await waitFor(() => {
      expect(screen.getByText('LIVE CODING')).toBeInTheDocument();
      expect(screen.getByText('Latest Recording')).toBeInTheDocument();
    });
  });

  it('fetches and displays GIF on mount', async () => {
    const mockGifUrl = 'https://github.com/SobralCybersec/SobralCybersec/releases/download/2024-01-01.12-00-00/demo.gif';
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      text: async () => `<img src="${mockGifUrl}" />`,
    });

    render(<LivePreview />);

    await waitFor(() => {
      const img = screen.getByAltText('Live Coding Session');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', mockGifUrl);
    });
  });

  it('shows loading state while fetching', async () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<LivePreview />);

    await waitFor(() => {
      expect(screen.getByText('Loading latest session...')).toBeInTheDocument();
    });
  });

  it('handles fetch error gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<LivePreview />);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  it('handles missing GIF URL in README', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      text: async () => 'No GIF here',
    });

    render(<LivePreview />);

    await waitFor(() => {
      expect(screen.getByText('GIF URL not found in README')).toBeInTheDocument();
    });
  });

  it('refreshes GIF when refresh button clicked', async () => {
    const mockGifUrl = 'https://github.com/SobralCybersec/SobralCybersec/releases/download/2024-01-01.12-00-00/demo.gif';
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: async () => `<img src="${mockGifUrl}" />`,
    });

    render(<LivePreview />);

    await waitFor(() => {
      expect(screen.getByAltText('Live Coding Session')).toBeInTheDocument();
    });

    const refreshButton = screen.getByLabelText('Refresh');
    await userEvent.click(refreshButton);

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('disables refresh button while loading', async () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<LivePreview />);

    await waitFor(() => {
      const refreshButton = screen.getByLabelText('Refresh');
      expect(refreshButton).toBeDisabled();
    });
  });

  it('extracts and displays last updated timestamp', async () => {
    const mockGifUrl = 'https://github.com/SobralCybersec/SobralCybersec/releases/download/2024-12-25.14-30-45/demo.gif';
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      text: async () => `<img src="${mockGifUrl}" />`,
    });

    render(<LivePreview />);

    await waitFor(() => {
      expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
      expect(screen.getByText(/2024:12:25/)).toBeInTheDocument();
    });
  });

  it('renders GitHub link', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      text: async () => '<img src="https://github.com/SobralCybersec/SobralCybersec/releases/download/2024-01-01.12-00-00/demo.gif" />',
    });

    render(<LivePreview />);

    await waitFor(() => {
      const link = screen.getByRole('link', { name: /View on GitHub/i });
      expect(link).toHaveAttribute('href', 'https://github.com/SobralCybersec/SobralCybersec');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });
});
