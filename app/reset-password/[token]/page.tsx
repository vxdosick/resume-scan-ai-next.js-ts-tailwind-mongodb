'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Notification from '@/app/components/Notification';

const ResetPasswordToken = ({ params }: { params: { token: string } }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const response = await fetch(`/api/auth/reset-password/${params.token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });

    const data = await response.json();

    if (response.ok) {
      setSuccess('Password successfully reset. Redirecting to dashboard...');
      setTimeout(() => router.push('/dashboard'), 3000);
    } else {
      setError(data.message || 'Failed to reset password.');
    }
  };

  return (
    <div className="wrapper">
      <main className="flex items-center justify-center flex-col h-screen">
        <h1 className="text-2xl text-center mb-4">Reset Your Password</h1>
        {error && <Notification message={error} onClose={() => setError('')} />}
        {success && <Notification message={success} onClose={() => setSuccess('')} />}
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block mb-4 p-2 border rounded"
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="block mb-4 p-2 border rounded"
          />
          <button type="submit" className="p-2 bg-blue-500 text-white rounded">
            Reset Password
          </button>
        </form>
      </main>
    </div>
  );
};

export default ResetPasswordToken;
