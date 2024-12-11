import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAuth } from '@/app/api/middleware/auth';

export async function middleware(request: NextRequest) {
    
  const url = request.nextUrl.pathname;

  // Пропускаем проверку для публичных маршрутов
  if (
    url.startsWith('/api/reset-password') || // Публичные маршруты
    url.startsWith('/api/login') || // Страница входа
    url.startsWith('/api/register')  // Страница регистрации
    // url.startsWith('/api/save-feedback') // Страница регистрации
  ) {
    return NextResponse.next();
  }

  // Проверяем авторизацию
  const authResult = await verifyAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult; // Возвращаем ошибку, если токен недействителен
    console.log("YOU ARE NOT AUTHENTICATED");
    
  }

  // Продолжаем выполнение
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'], // Применяем middleware только к API маршрутам
};
