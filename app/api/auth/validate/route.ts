import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

interface DecodedToken {
  userId: string;
  email: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Authorization header missing or invalid');
      return NextResponse.json(
        { message: 'Authorization header missing or invalid' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    console.log('Token received:', token);

    if (!token) {
      console.error('Token is missing');
      return NextResponse.json(
        { message: 'Token is missing' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    console.log('Token successfully decoded:', decoded); 
    return NextResponse.json(
      { valid: true, user: decoded },
      { status: 200 }
    );
  } catch (error) {
    console.error('JWT verification error:', error);

    return NextResponse.json(
      { message: 'Invalid or expired token', error: String(error) },
      { status: 401 }
    );
  }
}