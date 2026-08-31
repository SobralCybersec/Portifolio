import { Ratelimit } from '@upstash/ratelimit';
import { redis } from './chat';

// Strict limit for auth routes — 10 attempts per minute per IP
export const authLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  analytics: true,
  prefix: 'rl:auth',
});

// Chat POST — 20 messages per minute per user
export const chatLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '1 m'),
  analytics: true,
  prefix: 'rl:chat',
});

// General API — 100 requests per minute per IP
export const generalLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
  prefix: 'rl:general',
});