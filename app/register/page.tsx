'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Notification from '../components/Notification'; // Подключаем компонент для уведомлений

const Register = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // Новый state для подтверждения пароля
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Пароли должны совпадать');
      return;
    }

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      router.push('/email-confirmation'); // Перенаправляем на страницу с сообщением о подтверждении
    } else {
      setError(data.message || 'Ошибка регистрации');
    }
  };

  return (
    <div className='wrapper'>
      <main className='flex items-center justify-center flex-col h-screen'>
        <div className='main__header'>
          <h1 className="text-2xl text-center mb-6">Register</h1>
        </div>
        <div>
          {error && <Notification message={error} onClose={() => setError('')} />}
          <form onSubmit={handleRegister}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block mb-2 p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="block mb-2 p-2 border rounded"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block mb-2 p-2 border rounded"
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="block mb-4 p-2 border rounded"
            />
            <div className=''>
              <Link href="/login">Login</Link>
            </div>
            <button type="submit" className="p-2 w-full bg-blue-500 text-white rounded">
              Register
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Register;
