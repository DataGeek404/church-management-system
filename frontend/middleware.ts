import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const pathname = request.nextUrl.pathname;

  // Public pages
  const publicPages = ['/login', '/register', '/'];

  // Role-based page access
  const roleBasedPages: { [key: string]: string[] } = {
    '/users': ['admin'],
    '/members': ['admin', 'staff'],
    '/attendance': ['admin', 'staff'],
    '/financial': ['admin', 'staff'],
    '/communications': ['admin', 'staff'],
    '/reports': ['admin', 'staff'],
    '/logs': ['admin'],
    '/events': ['admin', 'staff', 'user'],
    '/profile': ['admin', 'staff', 'user'],
    '/dashboard': ['admin', 'staff'], // dashboard - NOT accessible to normal users
  };

  // If no token and not a public page, redirect to login
  if (!token && !publicPages.includes(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If has token and trying to access public pages, allow
  if (token && publicPages.includes(pathname)) {
    return NextResponse.next();
  }

  // Allow public pages without token
  if (publicPages.includes(pathname)) {
    return NextResponse.next();
  }

  // Decode token and check role-based access
  if (token) {
    try {
      const decoded: any = jwtDecode(token);
      const userRole = decoded?.role;

      // Check if current pathname requires specific roles
      for (const [page, allowedRoles] of Object.entries(roleBasedPages)) {
        // Exact match or is a subpath
        if (pathname === page || pathname.startsWith(page + '/')) {
          // If route requires role restriction and user role is not allowed
          if (allowedRoles && !allowedRoles.includes(userRole)) {
            // Redirect normal users from dashboard to events
            if (pathname === '/dashboard' && userRole === 'user') {
              return NextResponse.redirect(new URL('/events', request.url));
            }
            // Redirect unauthorized users to a safe page
            return NextResponse.redirect(new URL('/events', request.url));
          }
          break;
        }
      }
    } catch (error) {
      console.error('Error decoding token in middleware:', error);
      // If token is invalid, clear it and redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth_token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

