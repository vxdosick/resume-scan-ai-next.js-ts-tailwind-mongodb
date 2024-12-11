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

    // Генерируем токен для подтверждения email
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: '1h', // Токен действует 1 час
    });

    // Генерируем ссылку для подтверждения
    const confirmationLink = `${BASE_URL}/api/auth/confirm-email?token=${token}`;

    // Настраиваем отправку email
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    // Отправляем email с подтверждением
    await transporter.sendMail({
      from: EMAIL_USER,
      to: email,
      subject: 'Подтверждение учётной записи',
      html: `<p>Пожалуйста, подтвердите свою учётную запись, перейдя по ссылке:</p>
             <a href="${confirmationLink}">Подтвердить учётную запись</a>`,
    });

    // Возвращаем успешный ответ
    return NextResponse.json({ message: 'Confirmation email sent' }, { status: 200 });
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    // Обработка ошибок при отправке email
    return NextResponse.json({ message: 'Error sending confirmation email', error }, { status: 500 });
  }
}

// Комментарии:
// 1. Код подключается к базе данных и ищет пользователя по email.
// 2. Генерируется токен с ограниченным сроком действия для подтверждения email.
// 3. Отправляется письмо с подтверждением через Nodemailer.
// 4. Обработаны ошибки для случаев, когда пользователь не найден или отправка письма не удалась.
// 5. Логирование помогает диагностировать проблемы.
