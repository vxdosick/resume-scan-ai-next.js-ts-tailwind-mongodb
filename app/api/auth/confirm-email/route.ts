import { NextResponse } from 'next/server';
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      console.error('Token not provided');
      return NextResponse.json({ message: 'Token not provided' }, { status: 400 });
    }

    // Декодируем токен и проверяем его
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    } catch (error) {
      console.error('Invalid token:', error);
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
    }

    await connectToDatabase();

    // Ищем пользователя в базе данных
    const user = await User.findById(decoded.userId);
    if (!user) {
      console.error('User not found for ID:', decoded.userId);
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Проверяем, активирован ли пользователь
    if (user.isActive) {
      console.log('User is already active:', user.email);
      return NextResponse.json({ message: 'Account is already activated' }, { status: 400 });
    }

    // Активируем учётную запись
    user.isActive = true;
    await user.save();

    console.log('Account activated for user:', user.email);

    // Перенаправляем на страницу логина
    return NextResponse.redirect(new URL('/login', request.url));
  } catch (error) {
    console.error('Unhandled error during email confirmation:', error);
    return NextResponse.json({ message: 'Email confirmation error', error }, { status: 500 });
  }
}