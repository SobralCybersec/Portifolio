import { GET } from '../route';

global.fetch = jest.fn();

class MockRequest {
  constructor(public url: string) {}
}

global.Request = MockRequest as any;

describe('/api/github/repos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GITHUB_TOKEN = 'test_token_123';
  });

  afterEach(() => {
    delete process.env.GITHUB_TOKEN;
  });

  it('returns repositories successfully', async () => {
    const mockRepos = [
      {
        id: 1,
        name: 'test-repo',
        description: 'Test',
        html_url: 'https://github.com/test/repo',
        stargazers_count: 10,
        forks_count: 5,
        language: 'TypeScript',
        topics: ['test'],
        homepage: null,
        owner: { login: 'test' },
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockRepos,
    });

    const request = new MockRequest('http://localhost:3000/api/github/repos') as any;
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockRepos);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('api.github.com'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test_token_123',
        }),
      })
    );
  });

  it('handles missing token gracefully', async () => {
    delete process.env.GITHUB_TOKEN;

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    const request = new MockRequest('http://localhost:3000/api/github/repos') as any;
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.not.objectContaining({
          Authorization: expect.any(String),
        }),
      })
    );
  });

  it('handles GitHub API errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    const request = new MockRequest('http://localhost:3000/api/github/repos') as any;
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toHaveProperty('error');
  });

  it('handles rate limit errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ message: 'API rate limit exceeded' }),
    });

    const request = new MockRequest('http://localhost:3000/api/github/repos') as any;
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toContain('rate limit');
  });

  it('handles network errors', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const request = new MockRequest('http://localhost:3000/api/github/repos') as any;
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toHaveProperty('error');
  });
});
