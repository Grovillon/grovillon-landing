// File: app/login/page.jsx
'use client';

export default function LoginPageDisabled() {
  // Login προσωρινά απενεργοποιημένο
  return null;
}

/*
  Παλιά έκδοση για μελλοντική χρήση


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

        <div className="relative flex flex-col gap-4 w-full max-w-sm bg-[#111] p-8 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0._]()
