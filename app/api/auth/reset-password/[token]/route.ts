import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

interface DecodedToken {
  userId: string;
  email: string;
}

import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

export async function POST(request: Request, { params }: { params: { token: string } }) {
  try {
    // Извлекаем новый пароль из тела запроса
    const { password } = await request.json();

    // Проверяем и декодируем токен
    const decoded: DecodedToken = jwt.verify(params.token, JWT_SECRET) as DecodedToken;

    // Подключаемся к базе данных
    await connectToDatabase();

    // Ищем пользователя по ID из токена
    const user = await User.findById(decoded.userId);
    if (!user) {
      // Если пользователь не найден
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Хешируем новый пароль
    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    await user.save();

    // Возвращаем успешный ответ
    return NextResponse.json({ message: 'Password successfully reset' }, { status: 200 });
  } catch (error) {
    console.error('Error resetting password:', error);
    // Обработка ошибок при сбросе пароля
    return NextResponse.json({ message: 'Error resetting password', error }, { status: 500 });
  }
}

// Комментарии:
// 1. Код проверяет токен на валидность и извлекает данные пользователя.
// 2. Новый пароль хешируется для безопасности и обновляется в базе данных.
// 3. Возвращается успешный ответ при удачном обновлении пароля.
// 4. Логирование ошибок помогает диагностировать возможные проблемы.
