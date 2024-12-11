import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
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

    // Извлекаем данные из тела запроса
    const { username, email, password } = await request.json();

    // Проверяем существование пользователя
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      // Если пользователь уже существует
      return NextResponse.json({ message: 'The user already exists' }, { status: 400 });
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 12);

    // Создаём нового пользователя
    const newUser = new User({ username, email, password: hashedPassword, isActive: false });
    await newUser.save();

    // Генерируем токен для подтверждения email
    const token = jwt.sign({ userId: newUser._id, email: newUser.email }, JWT_SECRET, {
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
    return NextResponse.json({ message: 'Confirmation email sent' }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    // Обработка ошибки регистрации
    return NextResponse.json({ message: 'Registration error', error }, { status: 500 });
  }
}

// Комментарии:
// 1. Код проверяет существование пользователя и предотвращает дублирование.
// 2. Хеширование пароля для обеспечения безопасности.
// 3. Генерация токена для подтверждения email и отправка письма.
// 4. Обработаны возможные ошибки на каждом этапе процесса.
// 5. Логирование помогает в диагностике проблем.
