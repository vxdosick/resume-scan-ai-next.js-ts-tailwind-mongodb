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

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrUsername, password }),
    });

    if (response.ok) {
      const { accessToken, userId, username } = await response.json();
      localStorage.setItem('accessToken', accessToken); // Сохраняем токен
      localStorage.setItem('userId', userId); // Сохраняем userId
      localStorage.setItem('username', username); // Сохраняем userId
      router.push('/dashboard');
    } else {
      const data = await response.json();
      setError(data.message || 'Login failed');
    }
  };

  return (
    <div className="wrapper">
      <main className="flex items-center justify-center flex-col h-screen">
        <h1 className="text-2xl text-center mb-6">Login</h1>
        {error && <p className="text-red-500">{error}</p>}
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Email or Username"
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            className="block mb-2 p-2 border rounded"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block mb-4 p-2 border rounded"
          />
          <div className="flex justify-between items-center">
            <Link href="/reset-password">
              <p className="text-blue-500">Forgot Password</p>
            </Link>

            <Link href="/register">
              <p className="text-blue-500">Register</p>
            </Link>
          </div>
          <button type="submit" className="p-2 w-full bg-blue-500 text-white rounded">
            Login
          </button>
        </form>
      </main>
    </div>
  );
};

export default Login;
