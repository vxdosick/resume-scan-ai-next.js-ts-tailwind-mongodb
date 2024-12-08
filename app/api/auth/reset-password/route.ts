import { NextResponse } from 'next/server';
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
    await connectToDatabase();
    const { email } = await request.json();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Генерируем токен для восстановления
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: '1h',
    });

    // Ссылка для восстановления пароля
    const resetLink = `${BASE_URL}/reset-password/${token}`;

    // Настраиваем отправку письма
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      html: `<p>Click the link below to reset your password:</p>
             <a href="${resetLink}">Reset Password</a>`,
    });

    return NextResponse.json({ message: 'Password reset link sent' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error sending reset link', error }, { status: 500 });
  }
}
