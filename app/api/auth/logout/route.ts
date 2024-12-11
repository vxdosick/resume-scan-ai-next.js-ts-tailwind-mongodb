import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

import dotenv from 'dotenv';
dotenv.config();

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json({ message: 'Refresh Token not provided' }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findOne({ refreshToken });
    if (!user) {
      return NextResponse.json({ message: 'Invalid Refresh Token' }, { status: 403 });
    }

    // Удаляем Refresh Token из базы данных
    user.refreshToken = null;
    await user.save();

    // Удаляем куки
    return NextResponse.json(
      { message: 'Logged out successfully' },
      {
        headers: {
          'Set-Cookie': `accessToken=; HttpOnly; Path=/; Max-Age=0`, // Удаляем токен
        },
      }
    );
  } catch (error) {
    console.error('Error during logout:', error);
    return NextResponse.json({ message: 'Logout error', error }, { status: 500 });
  }
}
