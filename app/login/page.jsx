'use client';

// 👉 Η τωρινή inactive έκδοση — το /login δεν δείχνει τίποτα
export default function LoginPage() {
  return null;
}

/*
===========================================================================
ΠΑΛΙΑ LOGIN ΕΚΔΟΣΗ (ΚΡΑΤΙΕΤΑΙ ΩΣ BACKUP, ΔΕΝ ΤΡΕΧΕΙ)
===========================================================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/check-whitelist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.allowed) {
        router.push('/trusted');
      } else {
        setError('Access denied. Invitation not found or wrong password.');
      }
    } catch (err) {
      setError('Something went wrong.');
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-4 font-[Georgia,serif]">
      <h1 className="text-2xl mb-6">Login</h1>

      <div className="relative flex flex-col gap-4 w-full max-w-sm bg-[#111] p-8 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)]">
        <div
          className="absolute top-[-20px] right-[10px] text-[0.9rem] text-[#a6b3c0] underline cursor-pointer hover:text-white transition leading-none font-normal"
          onClick={() => router.push('/')}
        >
          Close
        </div>

        <input
          type="email"
          placeholder="Email"
          className="bg-[#222] text-white text-sm p-3 rounded-md"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            className="bg-[#222] text-white text-sm p-3 rounded-md w-full pr-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-xs text-[#bbb] hover:text-white"
          >
            {showPassword ? 'Hide' : 'Show'}
          </span>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="bg-white text-black font-bold text-base px-6 py-2 rounded-md hover:bg-[#ddd] transition"
        >
          {loading ? 'Authenticating...' : 'Login'}
        </button>

        <button
          onClick={() => router.push('/reset-password')}
          className="text-sm underline text-gray-300 hover:text-white transition mt-[-6px]"
        >
          Forgot your password?
        </button>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
      </div>
    </main>
  );
}

===========================================================================
*/
