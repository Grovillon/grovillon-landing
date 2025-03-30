'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalSubmitted, setModalSubmitted] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/check-whitelist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.allowed) {
        router.push('/trusted');
      } else {
        setError('Access denied. Invitation not found.');
      }
    } catch (err) {
      setError('Something went wrong.');
    }

    setLoading(false);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalSubmitted(false);

    const data = {
      name: e.target.name.value,
      email: e.target.email.value,
      organization: e.target.organization.value,
      reason: e.target.reason.value,
      agreed: e.target.agree.checked,
    };

    try {
      await fetch('https://hook.eu2.make.com/la4g179q26aiawzkvoyd929c4xlbdikb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      setModalLoading(false);
      setModalSubmitted(true);
      e.target.reset();
    } catch (err) {
      setModalLoading(false);
      alert('Something went wrong. Please try again later.');
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-4 font-[Georgia,serif] relative">
      <h1 className="text-2xl mb-6">Login</h1>

      {/* Login Box */}
      <div className="relative flex flex-col gap-4 w-full max-w-sm bg-[#111] p-8 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)]">
        {/* Close Button (ίδιο με modal) */}
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

        <input
          type="password"
          placeholder="Password"
          className="bg-[#222] text-white text-sm p-3 rounded-md"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="bg-white text-black font-bold text-base px-6 py-2 rounded-md hover:bg-[#ddd] transition"
        >
          {loading ? 'Authenticating...' : 'Login'}
        </button>

        <button
          onClick={() => setShowModal(true)}
          className="bg-white text-black font-bold text-base px-6 py-2 rounded-md hover:bg-[#ddd] transition"
        >
          Request Access
        </button>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
      </div>

      {/* Request Access Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
          <form
            onSubmit={handleModalSubmit}
            className="bg-[#111] text-white p-8 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] flex flex-col gap-4 w-[90%] max-w-sm relative"
          >
            <div
  className="absolute top-3 -right-6 text-sm text-slate-300 underline cursor-pointer hover:text-white transition"
  onClick={() => router.push('/')}
>
  Close
</div>


            <input
              type="text"
              name="name"
              placeholder="Full Name"
              required
              className="w-full p-3 rounded-md bg-[#222] text-white text-sm"
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              required
              className="w-full p-3 rounded-md bg-[#222] text-white text-sm"
            />
            <input
              type="text"
              name="organization"
              placeholder="Organization / Affiliation (optional)"
              className="w-full p-3 rounded-md bg-[#222] text-white text-sm"
            />
            <textarea
              name="reason"
              placeholder="Reason for Request"
              required
              className="w-full p-3 rounded-md bg-[#222] text-white text-sm resize-vertical min-h-[80px]"
            />
            <label className="text-sm text-gray-300 text-left flex items-start gap-2">
              <input type="checkbox" name="agree" required className="scale-125 mt-1" />
              I agree to the{' '}
              <a
                href="https://github.com/Grovillon/grovillon-assets/raw/main/terms-preview.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#3581b1] underline"
              >
                preliminary confidentiality terms
              </a>
              .
            </label>
            <button
              type="submit"
              className="bg-white text-black font-bold text-base px-6 py-2 rounded-md hover:bg-[#ddd] transition"
            >
              Submit Request
            </button>

            {modalLoading && (
              <div className="text-white text-sm mt-2">Sending your request...</div>
            )}
            {modalSubmitted && (
              <div className="text-green-400 text-sm mt-2 text-center">
                Your request has been received. Please check your email for the next steps.
              </div>
            )}
          </form>
        </div>
      )}
    </main>
  );
}
