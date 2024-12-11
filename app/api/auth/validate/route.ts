import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

import dotenv from 'dotenv';
dotenv.config();

interface DecodedToken {
  userId: string;
  email: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

export async function POST(request: Request) {
  try {
    // Проверяем наличие заголовка Authorization
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Если заголовок отсутствует или некорректен
      console.error('Authorization header missing or invalid');
      return NextResponse.json(
        { message: 'Authorization header missing or invalid' },
        { status: 401 }
      );
    }

    // Извлекаем токен из заголовка
    const token = authHeader.split(' ')[1];
    console.log('Token received:', token); // Логируем токен для проверки

    if (!token) {
      // Если токен отсутствует
      console.error('Token is missing');
      return NextResponse.json(
        { message: 'Token is missing' },
        { status: 401 }
      );
    }

    // Проверяем токен
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    console.log('Token successfully decoded:', decoded); // Логируем декодированные данные

    // Возвращаем успешный ответ с данными пользователя
    return NextResponse.json(
      { valid: true, user: decoded },
      { status: 200 }
    );
  } catch (error) {
    console.error('JWT verification error:', error);
    // Обработка ошибок при проверке токена
    return NextResponse.json(
      { message: 'Invalid or expired token', error: String(error) },
      { status: 401 }
    );
  }
}

// Комментарии:
// 1. Код проверяет наличие токена в заголовке Authorization.
// 2. Логирование помогает отладить возможные проблемы с токеном.
// 3. Проверяется валидность токена с использованием JWT_SECRET.
// 4. В случае успешной проверки возвращаются данные пользователя.
// 5. Обработаны ошибки для недействительных или отсутствующих токенов.
