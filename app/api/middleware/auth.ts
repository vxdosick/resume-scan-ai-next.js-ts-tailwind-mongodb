import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key'; // Секретный ключ для проверки токена

export async function verifyAuth(request: NextRequest) {
  try {
    // Проверяем наличие токена в заголовке Authorization
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];

    // Альтернативно, можно искать токен в куках
    const tokenFromCookies = request.cookies.get('accessToken')?.value;

    if (!token && !tokenFromCookies) {
      return NextResponse.json(
        { message: 'Authentication token is missing' },
        { status: 401 }
      );
    }

    // Валидируем токен
    const decoded = jwt.verify(token || tokenFromCookies || '', JWT_SECRET);

    // Передаём данные пользователя для дальнейшего использования
    return decoded;
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
  }
}
