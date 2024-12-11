// File: Login route (login/route.ts)

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your_refresh_token_secret';

export async function POST(request: Request) {
  try {
    // Подключаемся к базе данных
    await connectToDatabase();

    // Извлекаем данные из тела запроса
    const { emailOrUsername, password } = await request.json();

    // Ищем пользователя по email или username
    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    if (!user) {
      // Если пользователь не найден
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (!user.isActive) {
      // Если пользователь не активирован
      return NextResponse.json({ message: 'Please confirm your email to activate your account' }, { status: 403 });
    }

    // Проверяем корректность пароля
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return NextResponse.json({ message: 'Incorrect password' }, { status: 401 });
    }

    // Генерация Access Token
    const accessToken = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' } // Токен действует 1 час
    );

    // Генерация Refresh Token
    const refreshToken = jwt.sign(
      { userId: user._id },
      REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' } // Токен действует 7 дней
    );

    // Сохраняем Refresh Token в базе данных
    user.refreshToken = refreshToken;
    await user.save();

    // Возвращаем Access Token и пользовательские данные
    return NextResponse.json(
      { accessToken, userId: user._id, username: user.username },
      {
        headers: {
          'Set-Cookie': `accessToken=${accessToken}; HttpOnly; Path=/; Max-Age=${60 * 60}`, // Устанавливаем токен в куки
        },
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    // Обработка ошибки входа
    return NextResponse.json({ message: 'Login error' }, { status: 500 });
  }
}

// Комментарии и улучшения:
// 1. Добавлены комментарии для каждого важного шага.
// 2. Структурирована генерация Access Token и Refresh Token.
// 3. Сохранён существующий функционал.
// 4. Код улучшен для читаемости и соответствия стандартам TypeScript.
