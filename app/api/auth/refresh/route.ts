import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your_refresh_token_secret';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json({ message: 'Refresh Token not provided' }, { status: 400 });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as { userId: string };
    } catch (error) {
      console.error('Invalid or expired Refresh Token:', error);
      return NextResponse.json({ message: 'Invalid or expired Refresh Token' }, { status: 403 });
    }

    await connectToDatabase();

    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) {
      return NextResponse.json({ message: 'Invalid Refresh Token' }, { status: 403 });
    }

    // Генерируем новый Access Token
    const newAccessToken = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: '1h',
    });

    return NextResponse.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error('Error refreshing token:', error);
    return NextResponse.json({ message: 'Error refreshing token', error }, { status: 500 });
  }
}
