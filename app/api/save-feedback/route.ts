import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Feedback from '@/models/Feedback';

export async function POST(request: Request) {
  try {
    const { username, rating, strengths, weaknesses, summary, fileName } =
      await request.json();

    if (!username || !rating || !strengths || !weaknesses || !summary || !fileName) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    await connectToDatabase();

    const feedbackCount = await Feedback.countDocuments({ username });

    if (feedbackCount >= 3) {
      return NextResponse.json({
        error: 'You can only save up to 3 resumes.',
      }, { status: 403 });
    }

    const feedback = new Feedback({
      username,
      rating,
      strengths,
      weaknesses,
      summary,
      fileName,
      createdAt: new Date(),
    });

    await feedback.save();

    return NextResponse.json({
      message: "Feedback saved successfully",
      feedback,
    });
  } catch (error) {
    console.error("Error saving feedback:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  try {
    await connectToDatabase();

    const feedbacks = await Feedback.find({ username }).sort({ createdAt: -1 });

    return NextResponse.json(feedbacks);
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    return NextResponse.json({ error: 'Failed to fetch feedbacks' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  try {
    await connectToDatabase();

    const result = await Feedback.findByIdAndDelete(id);

    if (!result) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    return NextResponse.json({ error: 'Failed to delete feedback' }, { status: 500 });
  }
}
