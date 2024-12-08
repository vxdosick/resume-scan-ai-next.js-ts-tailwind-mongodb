import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Feedback from '@/models/Feedback';

import dotenv from 'dotenv';
dotenv.config();

// POST: Сохранение отзыва
export async function POST(request: Request) {
    try {
      const { username, rating, strengths, weaknesses, summary } = await request.json();
  
      // Проверка на наличие всех необходимых полей
      if (!username || !rating || !strengths || !weaknesses || !summary) {
        return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
      }
  
      await connectToDatabase();
  
      // Создаём новый отзыв с датой создания
      const feedback = new Feedback({
        username,
        rating,
        strengths,
        weaknesses,
        summary,
        createdAt: new Date(), // Добавляем текущую дату
      });
      console.log(feedback);
      await feedback.save();
      
  
      return NextResponse.json({
        message: 'Feedback saved successfully',
        feedback: {
          username,
          rating,
          strengths,
          weaknesses,
          summary,
          createdAt: feedback.createdAt,
        },
      });
    } catch (error) {
      console.error('Error saving feedback:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

// GET: Получение отзывов для пользователя
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
  