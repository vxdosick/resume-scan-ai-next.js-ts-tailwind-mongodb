import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const protectedRoutes = ['/dashboard', '/profile', '/resume-summary'];
  const { pathname } = request.nextUrl;

  console.log('Current Path:', pathname); // Лог текущего пути

  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    const accessToken = request.cookies.get('accessToken');

    if (!accessToken) {
      console.log('No Access Token, redirecting to login');
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    console.log('Access Token found, proceeding');
  }

  return NextResponse.next();
}

// Указываем маршруты, к которым применяется middleware
export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*', '/resume-summary/:path*'],
};
