import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

export async function POST(request: Request) {
  try {
    // Подключаемся к базе данных
    await connectToDatabase();

    // Извлекаем email из тела запроса
    const { email } = await request.json();

    // Ищем пользователя по email
    const user = await User.findOne({ email });
    if (!user) {
      // Если пользователь не найден
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Генерируем токен для сброса пароля
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: '1h', // Токен действует 1 час
    });

    // Генерируем ссылку для сброса пароля
    const resetLink = `${BASE_URL}/reset-password/${token}`;

    // Настраиваем отправку email
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    // Отправляем письмо с ссылкой для сброса пароля
    await transporter.sendMail({
      from: EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      html: `<p>Click the link below to reset your password:</p>
             <a href="${resetLink}">Reset Password</a>`,
    });

    // Возвращаем успешный ответ
    return NextResponse.json({ message: 'Password reset link sent' }, { status: 200 });
  } catch (error) {
    console.error('Error sending reset link:', error);
    // Обработка ошибок при отправке email
    return NextResponse.json({ message: 'Error sending reset link', error }, { status: 500 });
  }
}

// Комментарии:
// 1. Код подключается к базе данных и ищет пользователя по email.
// 2. Генерируется токен для сброса пароля с ограниченным сроком действия.
// 3. Отправляется письмо с инструкцией по сбросу пароля через Nodemailer.
// 4. Обработаны ошибки для отсутствия пользователя и проблем с отправкой email.
