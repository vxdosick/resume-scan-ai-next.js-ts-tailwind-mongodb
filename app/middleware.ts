import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import jwt from 'jsonwebtoken';

import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';


export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;

  // Логируем токен
  console.log('Token received:', token);

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    jwt.verify(token, JWT_SECRET);
    return NextResponse.next();
  } catch (error) {
    console.error('Token validation error:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/dashboard', '/profile/:path*'],
};
