import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { username, email, password } = await request.json();

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return NextResponse.json({ message: 'The user already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({ username, email, password: hashedPassword, isActive: false });
    await newUser.save();

    const token = jwt.sign({ userId: newUser._id, email: newUser.email }, JWT_SECRET, {
      expiresIn: '1h',
    });

    const confirmationLink = `${BASE_URL}/api/auth/confirm-email?token=${token}`;

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

    return NextResponse.json({ message: 'Confirmation email sent' }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'Registration error', error }, { status: 500 });
  }
}