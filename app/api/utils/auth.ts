function isTokenExpired(token: string): boolean {
  try {
    if (token.split('.').length !== 3) return true;

    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch (error) {
    console.error('Error decoding token:', error);
    return true;
  }
}

export async function getAccessToken(): Promise<string> {
  try {
    const token = localStorage.getItem('accessToken');

    if (token && !isTokenExpired(token)) {
      return token;
    }

    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    if (response.ok) {
      const { accessToken } = await response.json();
      localStorage.setItem('accessToken', accessToken);
      return accessToken;
    } else {
      const errorData = await response.json();
      console.error('Failed to refresh token:', errorData.message || 'Unknown error');
      throw new Error('Failed to refresh token');
    }
  } catch (error) {
    console.error('Error fetching access token:', error);
    throw new Error('Could not retrieve access token');
  }
}