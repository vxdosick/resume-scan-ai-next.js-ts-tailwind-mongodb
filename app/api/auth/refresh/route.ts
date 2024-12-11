import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your_refresh_token_secret';

export async function POST() {
  try {
    // Извлекаем куки из запроса
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!refreshToken) {
      // Если Refresh Token отсутствует
      return NextResponse.json({ message: 'Refresh Token not provided' }, { status: 400 });
    }

    let decoded;
    try {
      // Проверяем Refresh Token
      decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as { userId: string };
    } catch (error) {
      console.error('Invalid or expired Refresh Token:', error);
      return NextResponse.json({ message: 'Invalid or expired Refresh Token' }, { status: 403 });
    }

    // Подключаемся к базе данных
    await connectToDatabase();

    // Ищем пользователя по ID из токена
    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) {
      return NextResponse.json({ message: 'Invalid Refresh Token' }, { status: 403 });
    }

    // Генерируем новый Access Token
    const newAccessToken = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: '1h', // Токен действует 1 час
    });

    // Возвращаем новый Access Token
    return NextResponse.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error('Error refreshing token:', error);
    // Обработка ошибок при обновлении токена
    return NextResponse.json({ message: 'Error refreshing token', error }, { status: 500 });
  }
}

// Комментарии:
// 1. Код проверяет наличие Refresh Token и его валидность.
// 2. Генерация нового Access Token при успешной проверке.
// 3. Обработаны ошибки для недействительных токенов и проблем с базой данных.
// 4. Логирование помогает в диагностике проблем.
