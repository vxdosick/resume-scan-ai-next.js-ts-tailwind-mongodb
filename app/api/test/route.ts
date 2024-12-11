import { NextResponse } from 'next/server';

// GET-запрос: просто проверяем, что маршрут работает
export const GET = async () => {
  return NextResponse.json({ message: 'Test route is working!' });
};

// POST-запрос: проверка токена выполняется через middleware
export const POST = async (req: Request) => {
  try {
    const body = await req.json(); // Получаем данные из тела запроса
    console.log('Received POST request:', body);

    // Возвращаем успешный ответ, если токен был валиден
    return NextResponse.json({
      message: 'Received data!',
      data: body,
    });
  } catch (error) {
    console.error('Error in POST route:', error);

    // Обрабатываем случай, если что-то пошло не так
    return NextResponse.json(
      { error: 'Failed to process the request', details: String(error) },
      { status: 500 }
    );
  }
};
