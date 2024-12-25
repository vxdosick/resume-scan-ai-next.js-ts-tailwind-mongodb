import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

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

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: '1h',
    });

    const resetLink = `${BASE_URL}/reset-password/${token}`;

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
    console.error('Error sending reset link:', error);
    return NextResponse.json({ message: 'Error sending reset link', error }, { status: 500 });
  }
}