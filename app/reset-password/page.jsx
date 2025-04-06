'use client';

import { useState } from 'react';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('https://hook.eu2.make.com/kgz9ge24exlb40kum3ontxcw63xkf9yw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Failed to connect. Please try again later.');
    }

    setLoading(false);
  };

  if (submitted) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black text-white p-6">
        <div className="text-center">
          <h2 className="text-xl mb-4">✅ Password reset request sent</h2>
          <p className="text-gray-400 text-sm">If your email exists in our system, it will be updated shortly.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white p-6">
      <form onSubmit={handleSubmit} className="bg-[#111] p-8 rounded-xl w-full max-w-md space-y-4 shadow-lg">
        <h1 className="text-2xl mb-4 font-serif">Reset Password</h1>

        <input
          type="email"
          required
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded bg-[#222] text-white text-sm"
        />
        <input
          type="password"
          required
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full p-3 rounded bg-[#222] text-white text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-black font-bold py-2 rounded hover:bg-gray-300 transition"
        >
          {loading ? 'Submitting...' : 'Reset Password'}
        </button>

        {error && <p className="text-red-400 text-sm text-center mt-2">{error}</p>}
      </form>
    </main>
  );
}
