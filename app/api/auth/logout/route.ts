import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!accessToken && !refreshToken) {
      return NextResponse.json({ message: 'Tokens not provided' }, { status: 400 });
    }

    if (accessToken) {
      try {
        jwt.verify(accessToken, JWT_SECRET);
      } catch (error) {
        console.warn('Invalid accessToken:', error);
      }
    }

    await connectToDatabase();

    if (refreshToken) {
      const user = await User.findOne({ refreshToken });
      if (user) {
        user.refreshToken = null;
        await user.save();
      }
    }

    return NextResponse.json(
      { message: 'Logged out successfully' },
      {
        headers: {
          'Set-Cookie': [
            `accessToken=; HttpOnly; Path=/; Max-Age=0`,
            `refreshToken=; HttpOnly; Path=/; Max-Age=0`,
          ].join(', '),
        },
      }
    );
  } catch (error) {
    console.error('Error during logout:', error);
    return NextResponse.json({ message: 'Logout error', error: String(error) }, { status: 500 });
  }
}
