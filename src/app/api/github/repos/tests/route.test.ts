import { GET } from '../route';

global.fetch = jest.fn();

// Mock NextRequest and NextResponse
jest.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    constructor(public url: string) {}
  },
  NextResponse: {
    json: (data: any, init?: { status?: number }) => ({
      json: async () => data,
      status: init?.status || 200,
      headers: new Map(),
      ok: (init?.status || 200) >= 200 && (init?.status || 200) < 300,
    }),
  },
}));

const { NextRequest } = require('next/server');

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

    // Mock all GitHub API calls (multiple usernames)
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => mockRepos })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });

    const request = new NextRequest('http://localhost:3000/api/github/repos');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });

  it('handles network errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    const request = new NextRequest('http://localhost:3000/api/github/repos');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toHaveProperty('error');
  });
});
