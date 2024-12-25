'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Notification from '../components/Notification';

const Register = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // Стейт для подтверждения пароля
  const [error, setError] = useState(''); // Стейт для ошибок
  const router = useRouter(); // Для перенаправления

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Сбрасываем предыдущие ошибки

    // Проверяем совпадение паролей
    if (password !== confirmPassword) {
      setError('Пароли должны совпадать');
      return;
    }

    try {
      // Отправляем запрос на регистрацию
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Перенаправляем на страницу подтверждения email
        router.push('/email-confirmation');
      } else {
        setError(data.message || 'Ошибка регистрации');
      }
    } catch (err) {
      console.error('Ошибка регистрации:', err);
      setError('Ошибка сервера. Попробуйте позже.');
    }
  };

  return (
    <div className="wrapper">
      <main className="flex items-center justify-center flex-col h-screen">
        <div className="main__header">
          <h1 className="text-2xl text-center mb-6">Register</h1>
        </div>
        <div>
          {error && <Notification message={error} onClose={() => setError('')} />}
          <form onSubmit={handleRegister}>
            {/* Поле для ввода email */}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block mb-2 p-2 border rounded"
              required
            />
            {/* Поле для ввода имени пользователя */}
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="block mb-2 p-2 border rounded"
              required
            />
            {/* Поле для ввода пароля */}
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block mb-2 p-2 border rounded"
              required
              minLength={6}
            />
            {/* Поле для подтверждения пароля */}
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="block mb-4 p-2 border rounded"
              required
              minLength={6}
            />
            <div className="">
              <Link href="/login" className="flex mb-2 text-blue-500">
                Login
              </Link>
            </div>
            {/* Кнопка для отправки формы */}
            <button
              type="submit"
              className="py-2 w-full text--normal bg-blue-300 text-white rounded-lg"
            >
              Register
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Register;
