import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGO_URI || '';

export async function GET(req: Request) {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();

    const userId = req.headers.get('user-id');
    if (!userId) {
      return NextResponse.json({ error: 'User ID not provided' }, { status: 400 });
    }

    if (!ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 });
    }

    const userObjectId = new ObjectId(userId);

    const user = await db.collection('users').findOne({ _id: userObjectId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ username: user.username });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await client.close();
  }
}
