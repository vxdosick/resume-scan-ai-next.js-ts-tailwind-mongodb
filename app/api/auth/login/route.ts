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
    await connectToDatabase();

    const { emailOrUsername, password } = await request.json();

    // Найти пользователя по email или username
    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (!user.isActive) {
      return NextResponse.json({ message: 'Please confirm your email to activate your account' }, { status: 403 });
    }

    // Проверка пароля
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return NextResponse.json({ message: 'Incorrect password' }, { status: 401 });
    }

    // Генерация Access Token
    const accessToken = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    console.log('Access Token:', accessToken);

    // Генерация Refresh Token
    const refreshToken = jwt.sign(
      { userId: user._id },
      REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    // Сохранение Refresh Token в базе данных
    user.refreshToken = refreshToken;
    await user.save();

    return NextResponse.json(
      { accessToken, userId: user._id, username: user.username }, // Добавление userId в ответ
      {
        headers: {
          'Set-Cookie': `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}`,
        },
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Login error' }, { status: 500 });
  }
}
