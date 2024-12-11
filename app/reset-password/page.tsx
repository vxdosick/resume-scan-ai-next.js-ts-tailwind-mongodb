"use client";

import Link from "next/link";
import { useState } from "react";
import Notification from "../components/Notification";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (response.ok) {
      setSuccess("A password reset link has been sent to your email.");
    } else {
      setError(data.message || "Failed to send password reset link.");
    }
  };

  return (
    <div className="wrapper">
      <main className="flex items-center justify-center flex-col h-screen">
        <h1 className="text-2xl text-center mb-4">Reset Password</h1>
        {error && <Notification message={error} onClose={() => setError("")} />}
        {success && (
          <Notification message={success} onClose={() => setSuccess("")} />
        )}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block mb-4 p-2 border rounded"
          />
          <div>
            <Link href="/login" className="flex mb-2 text-blue-500">
              Login
            </Link>
          </div>
          <button
            type="submit"
            className="py-2 w-full text--normal bg-blue-300 text-white rounded-lg"
          >
            Send Reset Link
          </button>
        </form>
      </main>
    </div>
  );
};

export default ResetPassword;
