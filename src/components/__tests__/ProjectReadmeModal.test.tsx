import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ProjectReadmeModal from '../ProjectReadmeModal';

const readmeResponse = (readme: string | null, ok = true) => ({
  ok,
  json: async () => (ok ? { readme } : { error: 'failed' }),
});

describe('ProjectReadmeModal', () => {
  const props = {
    owner: 'SobralCybersec',
    repoName: 'readme-project',
    githubUrl: 'https://github.com/SobralCybersec/readme-project',
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    document.body.style.overflow = '';
  });

  it('loads markdown, exposes GitHub link, and closes with Escape', async () => {
    global.fetch = jest.fn().mockResolvedValue(readmeResponse('# Project\n\nUseful docs'));
    render(<ProjectReadmeModal {...props} />);

    expect(screen.getByText('Loading README...')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/# Project/)).toBeInTheDocument());
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/github/repos/SobralCybersec/readme-project/readme',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(screen.getByRole('link', { name: 'Open on GitHub' })).toHaveAttribute('href', props.githubUrl);
    expect(document.body.style.overflow).toBe('hidden');

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(props.onClose).toHaveBeenCalled();
  });

  it('shows empty, error, and backdrop-close states', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce(readmeResponse(null));
    const empty = render(<ProjectReadmeModal {...props} />);
    await waitFor(() => expect(screen.getByText('No README found for this repository.')).toBeInTheDocument());
    fireEvent.mouseDown(screen.getByRole('presentation'));
    expect(props.onClose).toHaveBeenCalled();
    empty.unmount();
    expect(document.body.style.overflow).toBe('');

    global.fetch = jest.fn().mockResolvedValueOnce(readmeResponse(null, false));
    render(<ProjectReadmeModal {...props} />);
    await waitFor(() => expect(screen.getByText('README could not be loaded.')).toBeInTheDocument());
  });
});
