import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

interface DecodedToken {
    userId: string;
    email: string;
  }

import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

export async function POST(request: Request, { params }: { params: { token: string } }) {
  try {
    const { password } = await request.json();

    const decoded: DecodedToken = jwt.verify(params.token, JWT_SECRET) as DecodedToken;

    await connectToDatabase();

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json({ message: 'Password successfully reset' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error resetting password', error }, { status: 500 });
  }
}
