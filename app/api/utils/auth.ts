/* eslint-disable @typescript-eslint/no-unused-vars */

function isTokenExpired(token: string): boolean {
    if (token.split('.').length !== 3) return true; // Проверяем формат токена
  
    const payload = JSON.parse(atob(token.split('.')[1])); // Декодируем payload
    return payload.exp * 1000 < Date.now(); // Проверяем, истёк ли токен
  }
  
  export async function getAccessToken(): Promise<string> {
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
  }
  
  /* eslint-enable @typescript-eslint/no-unused-vars */
  