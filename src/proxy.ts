import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const handleI18nRouting = createMiddleware(routing);

export function proxy(request: NextRequest) {
  // Continue with i18n routing
  const response = handleI18nRouting(request);
  
  // Only set cache headers in production to avoid breaking dev mode
  if (process.env.NODE_ENV === 'production') {
    const pathname = request.nextUrl.pathname;
    
    // Static assets - aggressive caching
    const isStaticAsset = 
      pathname.startsWith('/_next/static') ||
      pathname.startsWith('/icons') ||
      pathname.startsWith('/images') ||
      pathname.match(/\.(jpg|jpeg|png|gif|ico|svg|webp|avif|woff|woff2|ttf|eot)$/);

    if (isStaticAsset) {
      response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    }

    // API routes - stale-while-revalidate
    if (pathname.startsWith('/api/')) {
      response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    }
  }

  // Security headers (always apply)
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
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ]
};
