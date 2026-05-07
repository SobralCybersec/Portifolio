import { NextRequest, NextResponse } from 'next/server';

export function checkAdminAccess(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;
  
  // Skip login page
  if (pathname.includes('/blog/admin/login')) {
    return null;
  }
  
  // Check if accessing admin routes
  if (pathname.includes('/blog/admin')) {
    // Check if admin is enabled
    const adminEnabled = process.env.NEXT_PUBLIC_ENABLE_ADMIN === 'true';
    
    if (!adminEnabled) {
      return NextResponse.redirect(new URL('/blog', request.url));
    }
    
    // Check for admin token in cookie or header
    const token = request.cookies.get('admin_token')?.value || 
                  request.headers.get('x-admin-token');
    
    const validToken = process.env.ADMIN_SECRET_TOKEN;
    
    if (token !== validToken) {
      // Redirect to login page
      const loginUrl = new URL('/blog/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  return null;
}
