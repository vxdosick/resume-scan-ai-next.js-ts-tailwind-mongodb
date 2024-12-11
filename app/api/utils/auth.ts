function isTokenExpired(token: string): boolean {
  try {
    if (token.split('.').length !== 3) return true; // Проверяем формат токена

    const payload = JSON.parse(atob(token.split('.')[1])); // Декодируем payload
    return payload.exp * 1000 < Date.now(); // Проверяем, истёк ли токен
  } catch (error) {
    console.error('Error decoding token:', error);
    return true; // Если ошибка при декодировании, считаем токен истёкшим
  }
}

export async function getAccessToken(): Promise<string> {
  try {
    const token = localStorage.getItem('accessToken');

    // Проверяем, есть ли токен и не истёк ли он
    if (token && !isTokenExpired(token)) {
      return token;
    }

    // Если токена нет или он истёк, обновляем его
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include', // Для отправки cookies с Refresh Token
    });

    if (response.ok) {
      const { accessToken } = await response.json();
      localStorage.setItem('accessToken', accessToken); // Сохраняем новый Access Token
      return accessToken;
    } else {
      // Обработка ошибок
      const errorData = await response.json();
      console.error('Failed to refresh token:', errorData.message || 'Unknown error');
      throw new Error('Failed to refresh token');
    }
  } catch (error) {
    console.error('Error fetching access token:', error);
    throw new Error('Could not retrieve access token');
  }
}