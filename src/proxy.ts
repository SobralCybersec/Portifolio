import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/config/routing';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// ─── Rate limiters ────────────────────────────────────────────────────────────
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
const hasRateLimitConfig = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
);

const authLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  prefix: 'rl:auth',
});

const chatLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '1 m'),
  prefix: 'rl:chat',
});

const generalLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  prefix: 'rl:general',
});

function getIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'anonymous'
  );
}

// ─── Middleware ───────────────────────────────────────────────────────────────
const handleI18nRouting = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const ip = getIP(request);

  // ── Rate limiting for /api routes (i18n middleware skips these) ──
  if (pathname.startsWith('/api/')) {
    if (!hasRateLimitConfig) {
      return NextResponse.next();
    }

    let result;

    if (pathname.startsWith('/api/auth')) {
      result = await authLimit.limit(ip);
    } else if (pathname.startsWith('/api/chat')) {
      result = await chatLimit.limit(ip);
    } else {
      result = await generalLimit.limit(ip);
    }

    if (!result.success) {
      return new NextResponse('Too many requests', {
        status: 429,
        headers: {
          'Content-Type': 'text/plain',
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': result.reset.toString(),
          'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
        },
      });
    }

    // Pass through to API route with rate limit headers
    const res = NextResponse.next();
    res.headers.set('X-RateLimit-Limit', result.limit.toString());
    res.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    res.headers.set('X-RateLimit-Reset', result.reset.toString());
    return res;
  }

  // ── i18n routing for all non-API routes ──
  const response = handleI18nRouting(request);

  // ── Cache headers (production only) ──
  if (process.env.NODE_ENV === 'production') {
    const isStaticAsset =
      pathname.startsWith('/_next/static') ||
      pathname.startsWith('/icons') ||
      pathname.startsWith('/images') ||
      pathname.match(/\.(jpg|jpeg|png|gif|ico|svg|webp|avif|woff|woff2|ttf|eot)$/);

    if (isStaticAsset) {
      response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    }

    // Don't cache API here — handled above
    // Page routes get no Cache-Control (Next.js handles this)
  }

  // ── Security headers (always) ──
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  matcher: [
    // i18n routes (no dots, no _next, no _vercel)
    '/((?!_next|_vercel|.*\\..*).*)',
    // API routes for rate limiting
    '/api/:path*',
  ],
};
