import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// 🔑 Секретный ключ для JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// 📚 Маршруты, которые не требуют аутентификации
const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/',
];

// 📚 API маршруты, которые не требуют аутентификации
const PUBLIC_API_ROUTES = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log(`[Middleware] Путь запроса: ${pathname}`);

  // ✅ 1. Пропускаем статические ресурсы
  if (
    pathname.startsWith('/_next/static') ||
    pathname.startsWith('/_next/image') ||
    pathname === '/favicon.ico' ||
    pathname.includes('/images')
  ) {
    return NextResponse.next();
  }

  // ✅ 2. Пропускаем публичные маршруты
  if (PUBLIC_ROUTES.includes(pathname)) {
    console.log(`[Middleware] Публичный маршрут: ${pathname} — доступ разрешён.`);
    return NextResponse.next();
  }

  // ✅ 3. Пропускаем публичные API маршруты
  if (PUBLIC_API_ROUTES.some(route => pathname.startsWith(route))) {
    console.log(`[Middleware] Публичный API-маршрут: ${pathname} — доступ разрешён.`);
    return NextResponse.next();
  }
  // ✅ 4. Проверяем токен
  const token = request.cookies.get('accessToken')?.value;

  if (!token) {
    console.warn(`[Middleware] Токен отсутствует. Перенаправление на /login.`);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    console.log(`[Middleware] Токен успешно проверен.`);
    return NextResponse.next();
  } catch (error) {
    console.error(`[Middleware] Ошибка проверки токена:`, error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// 🔄 Применяем Middleware к маршрутам
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
