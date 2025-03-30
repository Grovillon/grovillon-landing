'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RequestForm() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      name: e.target.name.value,
      email: e.target.email.value,
      organization: e.target.organization.value,
      reason: e.target.reason.value,
      agreed: e.target.agree.checked,
    };

    try {
      const res = await fetch('https://hook.eu2.make.com/la4g179q26aiawzkvoyd929c4xlbdikb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setSubmitted(true);
        e.target.reset();
      } else {
        alert("Something went wrong.");
      }
    } catch (err) {
      alert("Submission failed.");
    }

    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="bg-[#111]/80 backdrop-blur-md border border-white/10 text-white p-6 rounded-xl w-full max-w-[350px] text-center shadow-[0_0_50px_rgba(255,255,255,0.12)]">
        <p className="text-green-400 text-sm mb-4">
          Your request has been received.<br />
          Please check your email for the next steps.
        </p>
        <button
          onClick={() => router.push("/")}
          className="text-sm text-gray-400 hover:text-white underline"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#111]/80 backdrop-blur-md border border-white/10 text-white p-6 rounded-xl w-full max-w-[350px] flex flex-col gap-4 relative shadow-[0_0_50px_rgba(255,255,255,0.12)]"
    >
      {/* ❌ Close Button */}
      <button
        type="button"
        onClick={() => router.push("/")}
        className="absolute -top-6 right-2 text-sm text-gray-400 hover:text-white underline"
      >
        Close
      </button>

      <input type="text" name="name" placeholder="Full Name" required className="bg-[#222] p-3 rounded text-sm" />
      <input type="email" name="email" placeholder="Email Address" required className="bg-[#222] p-3 rounded text-sm" />
      <input type="text" name="organization" placeholder="Organization / Affiliation (optional)" className="bg-[#222] p-3 rounded text-sm" />
      <textarea name="reason" placeholder="Reason for Request" required className="bg-[#222] p-3 rounded text-sm min-h-[80px] resize-y" />

      <label className="text-sm text-gray-400">
        <input type="checkbox" name="agree" required className="mr-2 scale-110" />
        I agree to the{" "}
        <a
          href="https://github.com/Grovillon/grovillon-assets/raw/main/terms-preview.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-blue-400"
        >
          preliminary confidentiality terms
        </a>.
      </label>

      <button type="submit" className="bg-white text-black font-bold py-2 rounded hover:bg-gray-200 transition">
        {loading ? "Sending..." : "Submit Request"}
      </button>
    </form>
  );
}
