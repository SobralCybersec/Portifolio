import { GET } from '../route';

jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: unknown, init?: { status?: number; headers?: Record<string, string> }) => ({
      json: async () => data,
      status: init?.status ?? 200,
      headers: new Map(Object.entries(init?.headers ?? {})),
    }),
  },
}));

const githubResponse = (text: string, ok = true, status = 200) => ({
  ok,
  status,
  text: async () => text,
});

describe('GET /api/github/repos/[owner]/[repo]/readme', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GITHUB_TOKEN = 'test-token';
  });

  afterEach(() => {
    delete process.env.GITHUB_TOKEN;
  });

  it('rejects unknown owners and unsafe repository names', async () => {
    global.fetch = jest.fn();
    const unknownOwner = await GET({} as Request, { params: Promise.resolve({ owner: 'unknown', repo: 'repo' }) });
    const unsafeRepo = await GET({} as Request, { params: Promise.resolve({ owner: 'SobralCybersec', repo: 'bad/repo' }) });

    expect(unknownOwner.status).toBe(400);
    expect(unsafeRepo.status).toBe(400);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('returns README content, empty README, and upstream failures', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce(githubResponse('# Docs'))
      .mockResolvedValueOnce(githubResponse('', false, 404))
      .mockResolvedValueOnce(githubResponse('', false, 429));

    const success = await GET({} as Request, { params: Promise.resolve({ owner: 'SobralCybersec', repo: 'repo' }) });
    expect(await success.json()).toEqual({ readme: '# Docs' });
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.github.com/repos/SobralCybersec/repo/readme',
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer test-token' }) }),
    );

    const missing = await GET({} as Request, { params: Promise.resolve({ owner: 'SobralCybersec', repo: 'repo' }) });
    expect(await missing.json()).toEqual({ readme: null });
    const failure = await GET({} as Request, { params: Promise.resolve({ owner: 'SobralCybersec', repo: 'repo' }) });
    expect(failure.status).toBe(502);
  });

  it('returns 500 for unexpected failures', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('offline'));
    const response = await GET({} as Request, { params: Promise.resolve({ owner: 'SobralCybersec', repo: 'repo' }) });
    expect(response.status).toBe(500);
  });
});
