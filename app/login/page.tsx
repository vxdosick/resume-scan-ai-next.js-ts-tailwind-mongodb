'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const Login = () => {
  const [emailOrUsername, setEmailOrUsername] = useState(''); // Поле для ввода email или имени пользователя
  const [password, setPassword] = useState(''); // Поле для ввода пароля
  const [error, setError] = useState(''); // Стейт для отображения ошибок
  const router = useRouter(); // Навигация в Next.js

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Сбрасываем ошибки

    try {
      // Отправляем запрос на сервер
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrUsername, password }),
      });

      if (response.ok) {
        const { accessToken, userId, username } = await response.json();
        localStorage.setItem('accessToken', accessToken); // Сохраняем токен в localStorage
        localStorage.setItem('userId', userId); // Сохраняем userId
        localStorage.setItem('username', username); // Сохраняем username
        router.push('/dashboard'); // Перенаправляем пользователя на дашборд
      } else {
        const data = await response.json();
        setError(data.message || 'Login failed'); // Отображаем сообщение об ошибке
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again later.');
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
