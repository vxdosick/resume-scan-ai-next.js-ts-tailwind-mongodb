import { NextResponse } from 'next/server';

export const GET = async () => {
  return NextResponse.json({ message: 'Test route is working!' });
};

export const POST = async (req: Request) => {
  const body = await req.json();
  console.log('Received POST request:', body);
  return NextResponse.json({ message: 'Received data!', data: body });
};
