import { NextResponse } from 'next/server';
import path from 'path';

jest.mock('@/lib/auth/auth', () => ({ auth: jest.fn() }));
jest.mock('@/lib/chat/chat', () => ({
  redis: {
    get: jest.fn(), incr: jest.fn(), lrange: jest.fn(), lpush: jest.fn(), ltrim: jest.fn(),
  },
  pusher: { trigger: jest.fn() },
}));
jest.mock('@/lib/chat/ratelimit', () => ({ chatLimit: { limit: jest.fn() } }));
jest.mock('fs', () => ({ existsSync: jest.fn(() => false) }));
jest.mock('fs/promises', () => ({ mkdir: jest.fn(), writeFile: jest.fn() }));

import * as chatRoute from '@/app/api/chat/messages/route';
import * as healthRoute from '@/app/api/health/route';
import * as statsRoute from '@/app/api/github/stats/route';
import * as uploadRoute from '@/app/api/upload/route';
import * as visitorsRoute from '@/app/api/visitors/route';
import * as youtubeRoute from '@/app/api/youtube/config/route';

const auth = jest.requireMock('@/lib/auth/auth').auth as jest.Mock;
const limit = jest.requireMock('@/lib/chat/ratelimit').chatLimit.limit as jest.Mock;
const redis = jest.requireMock('@/lib/chat/chat').redis as Record<string, jest.Mock>;
const pusher = jest.requireMock('@/lib/chat/chat').pusher as { trigger: jest.Mock };

const jsonResponse = async (response: Response) => response.json() as Promise<any>;

beforeEach(() => {
  jest.clearAllMocks();
  auth.mockResolvedValue(null);
  limit.mockResolvedValue({ success: true });
});

describe('chat route', () => {
  test('returns newest messages and survives redis errors', async () => {
    redis.lrange.mockResolvedValue([{ id: 'old' }, { id: 'new' }]);
    expect(await jsonResponse(await chatRoute.GET())).toEqual([{ id: 'new' }, { id: 'old' }]);
    redis.lrange.mockRejectedValueOnce(new Error('redis down'));
    expect((await jsonResponse(await chatRoute.GET()))).toEqual([]);
  });

  test('validates session, rate limit, JSON, text, and publishes messages', async () => {
    expect((await chatRoute.POST({ json: async () => ({ text: 'x' }) } as Request)).status).toBe(401);
    auth.mockResolvedValueOnce({ user: { id: 'u1', name: 'Ada', image: '/a.png' } });
    limit.mockResolvedValueOnce({ success: false });
    expect((await chatRoute.POST({ json: async () => ({ text: 'x' }) } as Request)).status).toBe(429);

    auth.mockResolvedValue({ user: { id: 'u1' } });
    expect((await chatRoute.POST({ json: async () => { throw new Error('bad json'); } } as unknown as Request)).status).toBe(400);
    expect((await chatRoute.POST({ json: async () => ({ text: '  ' }) } as Request)).status).toBe(400);

    const message = { text: ' hello ', name: 'ignored' };
    const response = await chatRoute.POST({ json: async () => message } as Request);
    expect(response.status).toBe(201);
    expect(redis.lpush).toHaveBeenCalled();
    expect(redis.ltrim).toHaveBeenCalledWith('chat:messages', 0, 99);
    expect(pusher.trigger).toHaveBeenCalledWith('chat', 'message', expect.objectContaining({ text: 'hello', userName: 'Anonymous' }));
  });
});

describe('visitors and youtube routes', () => {
  test('reads and increments visitor count, including failures', async () => {
    redis.get.mockResolvedValueOnce(7);
    redis.incr.mockResolvedValueOnce(8);
    expect(await jsonResponse(await visitorsRoute.GET())).toEqual({ count: 7 });
    expect(await jsonResponse(await visitorsRoute.POST())).toEqual({ count: 8 });
    redis.get.mockRejectedValueOnce(new Error('read'));
    redis.incr.mockRejectedValueOnce(new Error('write'));
    expect((await visitorsRoute.GET()).status).toBe(500);
    expect((await visitorsRoute.POST()).status).toBe(500);
    redis.get.mockResolvedValueOnce(null);
    expect(await jsonResponse(await visitorsRoute.GET())).toEqual({ count: 0 });
  });

  test('returns configured or empty youtube URL', async () => {
    delete process.env.YOUTUBE_BACKGROUND_MUSIC;
    expect(await jsonResponse(await youtubeRoute.GET())).toEqual({ url: null });
    process.env.YOUTUBE_BACKGROUND_MUSIC = 'https://video.example/test';
    expect(await jsonResponse(await youtubeRoute.GET())).toEqual({ url: 'https://video.example/test' });
    delete process.env.YOUTUBE_BACKGROUND_MUSIC;
  });
});

describe('github stats route', () => {
  test('aggregates current and historical account data', async () => {
    process.env.GITHUB_USERNAME = 'octocat';
    process.env.GITHUB_TOKEN = 'token';
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ public_repos: 3 }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ public_repos: 4, created_at: '2015-01-01T00:00:00Z' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => [{ size: 20 }, { size: 30 }, {}] })
      .mockResolvedValueOnce({ ok: true, json: async () => [{ size: 50 }] });
    const response = await statsRoute.GET();
    expect(await jsonResponse(response)).toEqual(expect.objectContaining({ publicRepos: 7, totalCommits: 10 }));
    expect((global.fetch as jest.Mock).mock.calls[0][1]).toEqual(expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer token' }) }));

    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });
    expect((await statsRoute.GET()).status).toBe(200);
    delete process.env.GITHUB_USERNAME;
    delete process.env.GITHUB_TOKEN;
  });

  test('omits authorization when token is absent', async () => {
    delete process.env.GITHUB_TOKEN;
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ public_repos: 1 }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ public_repos: 2, created_at: '2020-01-01T00:00:00Z' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });
    await statsRoute.GET();
    expect((global.fetch as jest.Mock).mock.calls[0][1].headers.Authorization).toBeUndefined();
  });
});

describe('health route', () => {
  test('uses fallback package version when npm metadata is absent', async () => {
    const version = process.env.npm_package_version;
    delete process.env.npm_package_version;
    const data = await jsonResponse(await healthRoute.GET());
    expect(data.version).toBe('1.0.0');
    if (version === undefined) delete process.env.npm_package_version;
    else process.env.npm_package_version = version;
  });

  test('returns unhealthy response for Error and unknown thrown values', async () => {
    const memorySpy = jest.spyOn(process, 'memoryUsage')
      .mockImplementationOnce(() => { throw new Error('memory unavailable'); })
      .mockImplementationOnce(() => { throw 'unknown failure'; });
    expect((await healthRoute.GET()).status).toBe(503);
    expect(await jsonResponse(await healthRoute.GET())).toEqual(expect.objectContaining({ status: 'unhealthy', error: 'Unknown error' }));
    memorySpy.mockRestore();
  });
});

describe('upload route', () => {
  const requestWith = (file?: File) => ({ formData: async () => {
    return { get: () => file ?? null };
  } }) as any;

  test('rejects missing, MIME, and extension violations', async () => {
    expect((await uploadRoute.POST(requestWith())).status).toBe(400);
    expect((await uploadRoute.POST(requestWith(new File(['x'], 'x.txt', { type: 'text/plain' })))).status).toBe(400);
    expect((await uploadRoute.POST(requestWith(new File(['x'], 'x.txt', { type: 'image/png' })))).status).toBe(400);
  });

  test('writes sanitized allowed files and reports write failures', async () => {
    const file = {
      name: '../my image.png',
      type: 'image/png',
      arrayBuffer: async () => new TextEncoder().encode('image').buffer,
    } as unknown as File;
    const response = await uploadRoute.POST(requestWith(file));
    expect(response.status).toBe(200);
    expect((await jsonResponse(response)).filename).toMatch(/my-image\.png$/);

    const failingFile = {
      ...file,
      arrayBuffer: async () => { throw new Error('disk full'); },
    } as unknown as File;
    expect((await uploadRoute.POST(requestWith(failingFile))).status).toBe(500);
    const unknownFailure = { ...file, arrayBuffer: async () => { throw 'disk full'; } } as unknown as File;
    expect((await uploadRoute.POST(requestWith(unknownFailure))).status).toBe(500);

    const fsMock = jest.requireMock('fs').existsSync as jest.Mock;
    fsMock.mockReturnValue(false);
    expect((await uploadRoute.POST(requestWith(file))).status).toBe(200);
    expect(fsMock).toHaveBeenCalled();

    const realResolve = path.resolve;
    const resolveSpy = jest.spyOn(path, 'resolve').mockImplementation((...parts: string[]) =>
      resolveSpy.mock.calls.length === 1 ? realResolve(...parts) : '/outside/file'
    );
    expect((await uploadRoute.POST(requestWith(file))).status).toBe(400);
    resolveSpy.mockRestore();
  });
});

test('keeps NextResponse available for route test setup', () => {
  expect(NextResponse).toBeDefined();
});
