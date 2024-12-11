import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

export async function POST() {
  try {
    // Извлекаем accessToken и refreshToken из куков
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    const refreshToken = cookieStore.get('refreshToken')?.value;

    // Проверяем наличие токенов
    if (!accessToken && !refreshToken) {
      return NextResponse.json({ message: 'Tokens not provided' }, { status: 400 });
    }

    // Проверяем accessToken (только если он есть)
    if (accessToken) {
      try {
        jwt.verify(accessToken, JWT_SECRET);
      } catch (error) {
        console.warn('Invalid accessToken:', error);
      }
    }

    // Подключаемся к базе данных
    await connectToDatabase();

    // Если есть refreshToken, удаляем его из базы данных
    if (refreshToken) {
      const user = await User.findOne({ refreshToken });
      if (user) {
        user.refreshToken = null;
        await user.save();
      }
    }

    // Удаляем токены из куков
    return NextResponse.json(
      { message: 'Logged out successfully' },
      {
        headers: {
          'Set-Cookie': [
            `accessToken=; HttpOnly; Path=/; Max-Age=0`, // Удаляем accessToken
            `refreshToken=; HttpOnly; Path=/; Max-Age=0`, // Удаляем refreshToken
          ].join(', '),
        },
      }
    );
  } catch (error) {
    console.error('Error during logout:', error);
    // Обработка ошибок при выходе
    return NextResponse.json({ message: 'Logout error', error: String(error) }, { status: 500 });
  }
}
