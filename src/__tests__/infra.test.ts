jest.mock('next-auth', () => ({ __esModule: true, default: jest.fn(() => ({
  handlers: {}, signIn: jest.fn(), signOut: jest.fn(), auth: jest.fn(),
})) }));
jest.mock('next-auth/providers/github', () => ({ __esModule: true, default: jest.fn(() => ({ id: 'github' })) }));
jest.mock('pusher', () => ({ __esModule: true, default: jest.fn(() => ({})) }));
jest.mock('@upstash/redis', () => ({ Redis: jest.fn(() => ({})) }));
jest.mock('@upstash/ratelimit', () => {
  const instances: Array<{ limit: jest.Mock }> = [];
  class MockRatelimit {
    limit = jest.fn().mockResolvedValue({ success: true, limit: 100, remaining: 99, reset: Date.now() + 60000 });
    static slidingWindow = jest.fn(() => 'window');
    constructor() { instances.push(this); }
  }
  return { Ratelimit: MockRatelimit, instances };
});
jest.mock('next-intl/middleware', () => ({ __esModule: true, default: jest.fn(() => jest.fn(() => require('next/server').NextResponse.next())) }));
jest.mock('next-intl/routing', () => ({
  defineRouting: (value: unknown) => value,
  createNavigation: () => ({ Link: () => null, redirect: jest.fn(), usePathname: jest.fn(), useRouter: jest.fn() }),
}));

import { auth } from '@/lib/auth';
import { pusher, redis } from '@/lib/chat';
import { authLimit, chatLimit, generalLimit } from '@/lib/ratelimit';
import { proxy } from '@/proxy';

const authMock = jest.requireMock('next-auth').default as jest.Mock;
const pusherMock = jest.requireMock('pusher').default as jest.Mock;
const redisMock = jest.requireMock('@upstash/redis').Redis as jest.Mock;

const request = (pathname: string, headers: Record<string, string> = {}) => ({
  nextUrl: { pathname },
  headers: new Headers(headers),
}) as any;

test('initializes auth, chat, and rate-limit infrastructure', () => {
  expect(auth).toBeDefined();
  expect(pusher).toBeDefined();
  expect(redis).toBeDefined();
  expect(authMock).toHaveBeenCalled();
  expect(pusherMock).toHaveBeenCalledWith(expect.objectContaining({ useTLS: true }));
  expect(redisMock).toHaveBeenCalled();
  expect(authLimit).toBeDefined();
  expect(chatLimit).toBeDefined();
  expect(generalLimit).toBeDefined();
});

test('auth callbacks propagate ids and images', () => {
  const options = authMock.mock.calls[0][0];
  expect(options.providers).toHaveLength(1);
  expect(options.callbacks.jwt({ token: {}, user: { id: 'user-1' } })).toEqual({ id: 'user-1' });
  expect(options.callbacks.jwt({ token: {}, user: {} })).toEqual({});
  const session = { user: {} };
  expect(options.callbacks.session({ session, token: { id: 'id-1', picture: '/avatar.png' } })).toEqual({ user: { id: 'id-1', image: '/avatar.png' } });
  expect(options.callbacks.session({ session: { user: { id: 'old', image: '/old.png' } }, token: { sub: 'sub-1' } })).toEqual({ user: { id: 'sub-1', image: '/old.png' } });
  expect(options.callbacks.session({ session: {}, token: { sub: 'sub-1' } })).toEqual({});
});

test('proxy routes API limits and adds security/cache headers', async () => {
  const instances = jest.requireMock('@upstash/ratelimit').instances as Array<{ limit: jest.Mock }>;
  const result = { success: true, limit: 20, remaining: 19, reset: Date.now() + 60000 };
  instances.forEach(instance => instance.limit.mockResolvedValue(result));
  const apiResponse = await proxy(request('/api/chat/messages', { 'x-forwarded-for': ' 10.0.0.1, 10.0.0.2 ' }));
  expect(apiResponse.headers.get('X-RateLimit-Remaining')).toBe('19');
  expect(instances.some(instance => instance.limit.mock.calls.some(([ip]) => ip === '10.0.0.1'))).toBe(true);

  instances.at(-3)!.limit.mockResolvedValueOnce({ ...result, success: false, remaining: 0 });
  expect((await proxy(request('/api/auth/callback'))).status).toBe(429);
  instances.at(-1)!.limit.mockResolvedValueOnce({ ...result, success: false, remaining: 0 });
  expect((await proxy(request('/api/health'))).status).toBe(429);

  (process.env as Record<string, string | undefined>).NODE_ENV = 'production';
  const pageResponse = await proxy(request('/images/favicon.svg', { 'x-real-ip': '127.0.0.1' }));
  expect(pageResponse.headers.get('Cache-Control')).toContain('immutable');
  const nextStaticResponse = await proxy(request('/_next/static/chunk.js'));
  expect(nextStaticResponse.headers.get('Cache-Control')).toContain('immutable');
  expect(pageResponse.headers.get('X-Frame-Options')).toBe('SAMEORIGIN');
  (process.env as Record<string, string | undefined>).NODE_ENV = 'test';
});
