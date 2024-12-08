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

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { email } = await request.json();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: 'Пользователь не найден' }, { status: 404 });
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: '1h',
    });

    const confirmationLink = `${process.env.BASE_URL}/api/auth/confirm-email?token=${token}`;

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
      subject: 'Подтверждение учётной записи',
      html: `<p>Пожалуйста, подтвердите свою учётную запись, перейдя по ссылке:</p>
             <a href="${confirmationLink}">Подтвердить учётную запись</a>`,
    });

    return NextResponse.json({ message: 'Письмо с подтверждением отправлено' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Ошибка отправки письма', error }, { status: 500 });
  }
}
