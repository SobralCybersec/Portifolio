import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import LivePreview from '../LivePreview';

describe('LivePreview', () => {
  it('renders without crashing', () => {
    const { container } = render(<LivePreview />);
    expect(container).toBeTruthy();
  });

  it('renders GIF success, timestamp, refresh error, and retry paths', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        text: async () => '<img src="https://github.com/SobralCybersec/SobralCybersec/releases/download/2026-08-24.12-34-56.gif">',
      })
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: true, text: async () => '<p>no gif</p>' });
    render(<LivePreview />);
    await waitFor(() => expect(screen.getByAltText('Live Coding Session')).toBeInTheDocument());
    expect(screen.getByText(/lastUpdated/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
    await waitFor(() => expect(screen.getByText('Failed to fetch README')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'tryAgain' }));
    await waitFor(() => expect(screen.getByText('GIF URL not found in README')).toBeInTheDocument());
  });

  it('ignores success and non-Error failure after unmount', async () => {
    let resolveResponse: ((value: unknown) => void) | undefined;
    global.fetch = jest.fn().mockReturnValue(new Promise(resolve => { resolveResponse = resolve; }));
    const first = render(<LivePreview />);
    first.unmount();
    await act(async () => {
      resolveResponse?.({ ok: true, text: async () => '<p>cancelled</p>' });
    });

    let rejectResponse: ((reason?: unknown) => void) | undefined;
    global.fetch = jest.fn().mockReturnValue(new Promise((_resolve, reject) => { rejectResponse = reject; }));
    const second = render(<LivePreview />);
    second.unmount();
    await act(async () => {
      rejectResponse?.('offline');
    });

    global.fetch = jest.fn().mockRejectedValue('offline');
    render(<LivePreview />);
    await waitFor(() => expect(screen.getByText('Unknown error')).toBeInTheDocument());
  });
});
