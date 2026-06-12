import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_ROUTES = ['/admin'];
const TEACHER_ROUTES = ['/teacher'];
const AUTH_ROUTES = ['/login', '/signup'];
const PROTECTED_ROUTES = [
  '/dashboard', '/workspace', '/wizard', '/knowledge',
  '/review', '/pronunciation', '/resources', '/ai-assistant', '/settings',
  '/lessons', '/levels', '/chat', '/notifications',
];

function getRole(request: NextRequest): string | null {
  // Check demo_role cookie first
  const demoRole = request.cookies.get('demo_role')?.value;
  if (demoRole) return demoRole;

  // Check Supabase session cookie
  const supabaseCookie = request.cookies.get('sb-session');
  if (supabaseCookie) {
    try {
      const session = JSON.parse(atob(supabaseCookie.value));
      return session.user?.role || null;
    } catch { /* ignore parse errors */ }
  }

  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = getRole(request);

  // Strip trailing slash
  const cleanPath = pathname.endsWith('/') && pathname !== '/'
    ? pathname.slice(0, -1)
    : pathname;

  // Auth pages — redirect to dashboard if already logged in
  if (AUTH_ROUTES.some(r => cleanPath.startsWith(r))) {
    if (role) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Protected routes — redirect to login if not authenticated
  if (PROTECTED_ROUTES.some(r => cleanPath.startsWith(r))) {
    if (!role) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // Admin routes — require Admin role
  if (ADMIN_ROUTES.some(r => cleanPath.startsWith(r))) {
    if (!role) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (role !== 'Admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Teacher routes — require TeacherTA or Admin
  if (TEACHER_ROUTES.some(r => cleanPath.startsWith(r))) {
    if (!role) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (role !== 'TeacherTA' && role !== 'Admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Student routes — require Student role
  if (cleanPath.startsWith('/student/')) {
    if (!role) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (role !== 'Student') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
