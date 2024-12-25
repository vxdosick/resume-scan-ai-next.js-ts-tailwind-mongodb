'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const Login = () => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
  
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrUsername, password }),
      });
  
      // Проверяем, успешен ли запрос
      if (!response.ok) {
        const data = await response.json().catch(() => null); // Обработка не-JSON ответа
        throw new Error(data?.message || `Login failed with status ${response.status}`);
      }
  
      const { userId, username } = await response.json();
  
      // Сохраняем только необходимые данные
      localStorage.setItem('userId', userId);
      localStorage.setItem('username', username);
  
      // Перенаправляем пользователя на Dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('Login error:', err || err);
      setError(err +'An error occurred. Please try again later.');
    }
  };
  

  return (
    <div className="wrapper">
      <main className="flex items-center justify-center flex-col h-screen">
        <h1 className="text-2xl text-center mb-6">Login</h1>
        {/* Сообщение об ошибке */}
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleLogin}>
          {/* Поле ввода для email или имени пользователя */}
          <input
            type="text"
            placeholder="Email or Username"
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            className="block mb-2 p-2 border rounded w-full"
            required
          />
          {/* Поле ввода для пароля */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block mb-4 p-2 border rounded w-full"
            required
          />
          {/* Ссылки на восстановление пароля и регистрацию */}
          <div className="flex justify-between items-center mb-4">
            <Link href="/reset-password">
              <p className="text-blue-500 cursor-pointer">Forgot Password?</p>
            </Link>
            <Link href="/register">
              <p className="text-blue-500 cursor-pointer">Register</p>
            </Link>
          </div>
          {/* Кнопка входа */}
          <button
            type="submit"
            className="py-2 w-full text--normal bg-blue-300 text-white rounded-lg"
          >
            Login
          </button>
        </form>
      </main>
    </div>
  );
};

export default Login;
