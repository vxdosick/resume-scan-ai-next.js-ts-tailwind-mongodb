import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your_refresh_token_secret';

export async function POST(request: Request) {
  try {
    // Подключение к базе данных
    await connectToDatabase();

    // Получаем данные из тела запроса
    const { emailOrUsername, password } = await request.json();

    // Поиск пользователя по email или username
    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { message: 'Please confirm your email to activate your account' },
        { status: 403 }
      );
    }

    // Проверка пароля
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return NextResponse.json(
        { message: 'Incorrect password' },
        { status: 401 }
      );
    }

    // Генерация Access и Refresh токенов
    const accessToken = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    // Сохраняем Refresh Token в базе данных
    user.refreshToken = refreshToken;
    await user.save();

    // Устанавливаем Access Token в куку
    const response = NextResponse.json({
      message: 'Login successful',
      userId: user._id,
      username: user.username,
    });

    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Secure только в продакшене
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60, // 1 час
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
